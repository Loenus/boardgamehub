<!-- NEW LOGIN PAGE -->

<template>
  <div class="position-relative vh-100">
    <a href="/t1" class="btn btn-primary rounded-circle position-absolute top-0 start-0 m-4">
      <i class="bi bi-arrow-left"></i>
    </a>
    <div class="d-flex flex-column justify-content-center align-items-center h-100 px-5 px-md-5">
      <h1 class="text-center mb-4">Login</h1>
      <form class="w-100" style="max-width: 400px;">
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control" id="email" placeholder="Enter your email" aria-label="Email address">
          </div>
        </div>
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input type="password" class="form-control" id="password" placeholder="Enter your password" aria-label="Password">
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 mb-3">Login</button>
        <div class="d-flex justify-content-between mb-3">
          <a href="#" class="text-decoration-none">Forgot password?</a>
          <a href="/sign1" class="text-decoration-none">Sign up</a>
        </div>
        <hr>
        <button type="button" class="btn btn-outline-primary w-100">Log in with Google</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
/* Stili personalizzati opzionali */
</style>