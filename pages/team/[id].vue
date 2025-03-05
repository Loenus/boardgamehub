<template>
  <div class="container mt-5">
    <h1>Team: {{ teamId }}</h1>
    <p>Dettagli del team in arrivo...</p>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
});
</script>