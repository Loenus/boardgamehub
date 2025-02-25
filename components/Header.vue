<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container-fluid col-auto">
      <a class="navbar-brand" href="/">SimpleHub</a>
    </div>
    <div class="container-fluid col-auto">
      <button class="btn btn-outline-secondary me-2" @click="toggleTheme">Switch Theme</button>
      <a class="btn btn-outline-primary me-2" href="/login">Sign in</a>
      <!--<a class="btn btn-outline-success" href="/signup">Sign up</a> -->
    </div>
  </nav>
</template>

<script lang="ts" setup>
const toggleTheme = () => {
  const colorMode = useColorMode()
  switch (colorMode.preference) {
    case 'light':
      colorMode.preference = 'dark'
      break
    case 'dark':
      colorMode.preference = 'light'
      break
    default:
      colorMode.preference = 'system'
  }
}
</script>
