<script setup lang="ts">
// Public — no auth middleware. See privacy.vue's note: bracketed [ ] bits
// are real gaps to fill in with actual legal-entity info before this goes
// to anyone other than the operator themselves.
</script>

<template>
  <main class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
    <div>
      <p class="eyebrow">Legal</p>
      <h1 class="display mt-1 text-3xl">Terms of service</h1>
      <p class="mt-2 text-sm text-(--color-fg-soft)">Last updated 2026-08-07.</p>
    </div>

    <div class="flex flex-col gap-4 text-sm text-(--color-fg-soft)">
      <p>
        These terms govern use of Rentila Sync, operated by
        <strong class="text-(--color-fg)">[legal name / address — fill in before sharing this page with
        anyone else]</strong>. By creating an account you agree to them. Questions:
        <a href="mailto:dietis13008@gmail.com" class="underline">dietis13008@gmail.com</a>.
      </p>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">The service</h2>
        <p class="mt-1">
          Rentila Sync is a read-only reconciliation tool: it reads your Rentila rent-payment
          records and your bank transaction history (via Bridge or Enable Banking) and matches
          them, so you can see which rent payments have landed. It does not initiate payments,
          modify your bank accounts, or write anything back to Rentila on your behalf — Rentila's
          own API doesn't allow that (see the README's "Phase 0 findings" if you're curious why).
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Your responsibilities</h2>
        <p class="mt-1">
          You're responsible for the accuracy of the Rentila and bank accounts you connect, and
          for verifying matches before relying on them for anything consequential — this is a
          convenience tool, not an accounting or legal record of your rental income.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">No warranty, limited liability</h2>
        <p class="mt-1">
          The service is provided "as is," in active early development, without warranty of any
          kind. Matching is best-effort (exact matches on tenant name + amount, or a lower-
          confidence fallback) and can be wrong — always sanity-check before treating a "matched"
          payment as ground truth. To the extent permitted by law, liability for any loss arising
          from use of the service is disclaimed.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Billing</h2>
        <p class="mt-1">
          Paid plans are billed via Stripe on a recurring basis at the price shown at checkout.
          Cancel anytime from the dashboard; access continues until the end of the paid period.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Termination</h2>
        <p class="mt-1">
          You can stop using the service and disconnect your integrations at any time. We may
          suspend or terminate accounts that abuse the service or violate these terms.
        </p>
      </section>

      <section>
        <h2 class="text-base font-medium text-(--color-fg)">Governing law</h2>
        <p class="mt-1">These terms are governed by French law.</p>
      </section>
    </div>

    <NuxtLink to="/" class="w-fit text-sm underline">Back home</NuxtLink>
  </main>
</template>
