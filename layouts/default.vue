<template>
  <div class="layout-container">
    <header>
      <Header />
    </header>
    <main class="content">
      <slot /> <!-- Qui verrà caricata la pagina -->
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script lang="ts" setup>

</script>

<style>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}
</style>