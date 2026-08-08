<script setup lang="ts">
/**
 * « Loyers » n'existe plus comme écran : la maquette consolide ce contenu
 * dans le Grand livre, qui montre les mêmes écritures (loyers et charges
 * remontés de Rentila) avec débit, crédit et solde plutôt qu'une liste plate.
 *
 * La page reste comme redirection plutôt que d'être supprimée : elle était en
 * ligne, elle a pu être mise en favori, et un 404 serait une régression pour
 * quelqu'un qui n'a rien demandé.
 */
definePageMeta({ redirect: '/dashboard/accounting' })
</script>

<template>
  <div />
</template>
