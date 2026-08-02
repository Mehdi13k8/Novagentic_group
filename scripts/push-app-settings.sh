#!/usr/bin/env bash
#
# scripts/push-app-settings.sh
#
# Pushes all NUXT_-prefixed keys — from the local .env file and/or already
# -exported NUXT_* environment variables — to the Azure Web App's Application
# Settings (which become container env vars in container-mode App Service).
#
# Can also run in reverse with --pull: reads the current NUXT_-prefixed
# settings from Azure and writes them back into the local .env, in case Azure
# has values your local .env doesn't (e.g. a teammate rotated a key there, or
# it was set directly in the Portal).
#
# Usage:
#   bash scripts/push-app-settings.sh                     # push local .env -> Azure
#   bash scripts/push-app-settings.sh --dry-run           # preview key names only, no Azure calls
#   bash scripts/push-app-settings.sh --skip-health-check # skip the post-push curl check
#   bash scripts/push-app-settings.sh --pull              # pull Azure -> local .env
#   bash scripts/push-app-settings.sh --pull --dry-run    # preview what --pull would change, no writes
#
# Sourcing (push mode):
#   - Local dev: reads NUXT_* keys from .env at the repo root.
#   - CI: reads NUXT_* keys already exported in the environment (e.g. injected
#     from GitHub Actions secrets via the workflow's `env:` block) — no .env
#     file is required or expected there.
#   - If both are present, exported env vars win over .env values.
#
# SAFETY NOTES — read before modifying this file:
#   - Never add `set -x` here: it would print the constructed --settings
#     array (which contains secret values) to stdout/stderr.
#   - The `az ... set` call always uses --output none. Only KEY NAMES are
#     ever echoed, never values. Same rule for --pull: only key names and
#     update/add/unchanged status are printed, never the values themselves.

set -euo pipefail

RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-Novagentic_group}"
APP_NAME="${AZURE_WEBAPP_NAME:-Novagentic}"
HEALTH_URL="${HEALTH_URL:-https://novagentic.fr}"

DRY_RUN=false
SKIP_HEALTH_CHECK=false
PULL=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --skip-health-check) SKIP_HEALTH_CHECK=true ;;
    --pull) PULL=true ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: $0 [--pull] [--dry-run] [--skip-health-check]" >&2
      exit 1
      ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null \
  || (cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd))"
ENV_FILE="$REPO_ROOT/.env"

if $PULL; then
  if ! command -v az >/dev/null 2>&1; then
    echo "ERROR: Azure CLI ('az') not found. Install: https://aka.ms/azcli" >&2
    exit 1
  fi

  if ! az account show --output none 2>/dev/null; then
    echo "ERROR: Not logged in to Azure CLI (or session expired). Run 'az login' first." >&2
    exit 1
  fi

  declare -A azure_values=()
  while IFS=$'\t' read -r key value; do
    [[ -z "$key" ]] && continue
    # az on this machine resolves to a Windows-side binary (WSL interop),
    # whose TSV output uses CRLF line endings; `read` only strips the `\n`,
    # so strip a lingering trailing `\r` off both fields defensively.
    key="${key%$'\r'}"
    value="${value%$'\r'}"
    azure_values["$key"]="$value"
  done < <(az webapp config appsettings list \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --query "[?starts_with(name, 'NUXT_')].[name,value]" \
    -o tsv)

  if [[ ${#azure_values[@]} -eq 0 ]]; then
    echo "No NUXT_-prefixed settings found on '$APP_NAME'. Nothing to pull." >&2
    exit 1
  fi

  if $DRY_RUN; then
    echo "[dry-run] --pull would sync ${#azure_values[@]} key(s) from Azure into .env:"
    printf '  - %s\n' "${!azure_values[@]}"
    exit 0
  fi

  orig_mode=644
  if [[ -f "$ENV_FILE" ]]; then
    orig_mode="$(stat -c '%a' "$ENV_FILE" 2>/dev/null || stat -f '%Lp' "$ENV_FILE" 2>/dev/null || echo 644)"
  else
    orig_mode=600
  fi

  tmp_file="$(mktemp "${ENV_FILE}.XXXXXX")"
  trap 'rm -f "$tmp_file"' EXIT

  declare -A seen=()
  if [[ -f "$ENV_FILE" ]]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" =~ ^(NUXT_[A-Z_]+)= ]]; then
        k="${BASH_REMATCH[1]}"
        if [[ -n "${azure_values[$k]+x}" ]]; then
          old_value="${line#*=}"
          new_value="${azure_values[$k]}"
          if [[ "$old_value" != "$new_value" ]]; then
            echo "updated: $k"
          else
            echo "unchanged: $k"
          fi
          printf '%s=%s\n' "$k" "$new_value" >> "$tmp_file"
          seen["$k"]=1
          continue
        fi
      fi
      printf '%s\n' "$line" >> "$tmp_file"
    done < "$ENV_FILE"
  fi

  for k in "${!azure_values[@]}"; do
    if [[ -z "${seen[$k]+x}" ]]; then
      echo "added: $k"
      printf '%s=%s\n' "$k" "${azure_values[$k]}" >> "$tmp_file"
    fi
  done

  mv "$tmp_file" "$ENV_FILE"
  trap - EXIT
  chmod "$orig_mode" "$ENV_FILE" 2>/dev/null || true

  echo "Local .env updated from '$APP_NAME'."
  exit 0
fi

# --- Gather NUXT_-prefixed keys from .env (if present) and the environment ---
declare -A found=()

if [[ -f "$ENV_FILE" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue      # blank
    [[ "$line" =~ ^[[:space:]]*# ]] && continue      # comment
    [[ "$line" =~ ^NUXT_[A-Z_]+= ]] || continue      # only NUXT_ keys

    key="${line%%=*}"
    value="${line#*=}"

    # Defensively strip a single layer of matching surrounding quotes.
    if [[ "$value" == \"*\" ]]; then
      value="${value:1:-1}"
    elif [[ "$value" == \'*\' ]]; then
      value="${value:1:-1}"
    fi

    found["$key"]="$value"
  done < "$ENV_FILE"
fi

# Already-exported NUXT_ env vars (e.g. from CI secrets) override .env values.
for var in "${!NUXT_@}"; do
  found["$var"]="${!var}"
done

if [[ ${#found[@]} -eq 0 ]]; then
  echo "ERROR: No NUXT_-prefixed keys found in .env or the environment. Nothing to push." >&2
  exit 1
fi

settings=()
keys=()
for key in "${!found[@]}"; do
  settings+=("${key}=${found[$key]}")
  keys+=("$key")
done

if $DRY_RUN; then
  echo "[dry-run] Would push ${#settings[@]} setting(s) to '$APP_NAME':"
  printf '  - %s\n' "${keys[@]}"
  exit 0
fi

# --- Preflight: az CLI installed + logged in ---
if ! command -v az >/dev/null 2>&1; then
  echo "ERROR: Azure CLI ('az') not found. Install: https://aka.ms/azcli" >&2
  exit 1
fi

if ! az account show --output none 2>/dev/null; then
  echo "ERROR: Not logged in to Azure CLI (or session expired). Run 'az login' first." >&2
  exit 1
fi

echo "Pushing ${#settings[@]} setting(s) to '$APP_NAME' ($RESOURCE_GROUP):"
printf '  - %s\n' "${keys[@]}"

az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --settings "${settings[@]}" \
  --output none

echo "Done. Azure will restart the container to apply the new settings (~30-60s)."

# --- Optional, best-effort health check (never fails the script) ---
if ! $SKIP_HEALTH_CHECK; then
  echo "Waiting for container restart, checking $HEALTH_URL ..."
  ok=false
  for _ in 1 2 3 4 5 6; do
    sleep 10
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$HEALTH_URL" || echo "000")"
    if [[ "$code" == "200" ]]; then
      ok=true
      break
    fi
  done
  if $ok; then
    echo "Health check OK: $HEALTH_URL responded 200."
  else
    echo "WARN: no 200 from $HEALTH_URL within 60s. Not necessarily a failure" \
         "(cold start can be slow) — check manually." >&2
  fi
fi
