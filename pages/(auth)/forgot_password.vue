<template>
  <div class="position-relative vh-100">
    <a href="/" class="btn btn-primary rounded-circle position-absolute top-0 start-0 m-4">
      <i class="bi bi-arrow-left"></i>
    </a>
    <div class="d-flex flex-column justify-content-center align-items-center h-100 px-5 px-md-5">
      <h1 class="text-center mb-4">Forgot Password</h1>
      <form @submit.prevent="handleSubmit" class="w-100" style="max-width: 400px;">
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter your email" aria-label="Email address">
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 mb-3">Send Email</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient()
const email = ref<string>('');

function handleSubmit() {
  console.log('Email:', email.value);
  sendResetEmail(email.value);
}

const url = useRequestURL();
const host = url.origin;
async function sendResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${host}/update_password`,
  })

  if (error) {
    console.error("Errore nel send email:", error.message);
  } else {
    console.log("Email mandata!", data);
    alert("Email di reset password inviata! controlla la tua casella elettronica.")
  }
}
</script>

<style>

</style>