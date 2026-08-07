<script setup lang="ts">
// Public — no auth middleware. Written to be accurate about what this app
// actually does (see README "Architecture") rather than generic
// boilerplate; the bracketed [ ] bits are real gaps (legal entity name/
// address) that need filling in with real info before this is shown to
// anyone other than the operator themselves — see the chat that added this.
</script>

<template>
  <main class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
    <div>
      <p class="eyebrow">Legal</p>
      <h1 class="display mt-1 text-3xl">Privacy policy</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">Last updated 2026-08-07.</p>
    </div>

    <div class="flex flex-col gap-4 text-sm text-(--color-fg-soft)">
      <p>
        Rentila Sync is operated by <strong class="text-(--color-fg)">[legal name / address — fill in before
        sharing this page with anyone else]</strong>. Contact for any privacy question or data request:
        <a href="mailto:dietis13008@gmail.com" class="underline">dietis13008@gmail.com</a>.
      </p>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">What this service does</h2>
        <p class="mt-1">
          Rentila Sync reads rent-payment data from your Rentila account and transaction
          history from your bank (via Bridge or Enable Banking, whichever you connect), and
          matches the two so you can see which rent payments have actually landed. It never
          initiates a payment and never modifies anything in your bank account.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Data we process</h2>
        <ul class="mt-1 list-disc space-y-1 pl-5">
          <li><strong class="text-(--color-fg)">Account:</strong> your email and a hashed (not plaintext) password.</li>
          <li>
            <strong class="text-(--color-fg)">Rentila:</strong> your Rentila API client ID/secret (encrypted at
            rest, AES-256-GCM), plus the property/tenant/lease/payment data it returns.
          </li>
          <li>
            <strong class="text-(--color-fg)">Bank data:</strong> account identifiers and transaction history
            (date, amount, description) for whichever account(s) you explicitly connect via Bridge
            or Enable Banking — read-only, never your bank login credentials, which we never see.
          </li>
          <li><strong class="text-(--color-fg)">Billing:</strong> handled by Stripe; we store a Stripe customer/subscription ID, not card details.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Why (legal basis)</h2>
        <p class="mt-1">
          Processing is necessary to perform the service you've asked for (matching your rent
          payments against your bank transactions) — contractual necessity, not consent-based
          marketing. We don't sell data or use it for advertising.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Third parties</h2>
        <p class="mt-1">
          Rentila (rentila.com), Bridge (bridgeapi.io) and/or Enable Banking (enablebanking.com)
          as bank-data aggregators, and Stripe for billing — each processes data under its own
          privacy policy for the piece it handles.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Retention &amp; deletion</h2>
        <p class="mt-1">
          Data is kept for as long as your account is active. Disconnecting a bank/Rentila
          integration stops new data from being pulled but doesn't retroactively delete what's
          already stored — email us to request deletion of your account and its data.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Your rights</h2>
        <p class="mt-1">
          Under GDPR you can request access to, correction of, or deletion of your data, or
          object to its processing, by emailing the address above.
        </p>
      </section>
    </div>

    <NuxtLink to="/" class="w-fit text-sm underline">Back home</NuxtLink>
  </main>
</template>
