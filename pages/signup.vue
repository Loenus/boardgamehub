<template>
  <div class="position-relative vh-100">
    <a href="/" class="btn btn-primary rounded-circle position-absolute top-0 start-0 m-4">
      <i class="bi bi-arrow-left"></i>
    </a>
    <div class="d-flex flex-column justify-content-center align-items-center h-100 px-5 px-md-5">
      <h1 class="text-center mb-4">Sign Up</h1>
      <form @submit.prevent="handleSubmit" class="w-100" style="max-width: 400px;">
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter your email" aria-label="Email address">
          </div>
        </div>
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" id="password" placeholder="Enter your password" aria-label="Password">
            <button class="btn btn-outline-light" type="button" @click="togglePassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" class="form-control" id="confirm-password" placeholder="Confirm password" aria-label="Confirm password">
            <button class="btn btn-outline-light" type="button" @click="togglePassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 mb-3">Sign Up</button>
        <div class="d-flex justify-content-end">
          <a href="/login" class="text-decoration-none">Login</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient()
const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>(''); 
const showPassword = ref<boolean>(false); // ref => proprietà reattiva, vue reagisce al cambiamento

function handleSubmit() {
  console.log('Email:', email.value);
  console.log('Password:', password.value);
  console.log('Confirm Password:', confirmPassword.value);
  //TODO: check sulla complessità delle password (realtime)
  //TODO: check se le due password coincidono (realtime?)
  if (password.value !== confirmPassword.value) {
    alert('le due password non sono uguali')
    return;
  }
  
  signUpWithEmail(email.value, password.value);
}

async function signUpWithEmail(email: string, password: string) {
  
  if (process.server) {
    console.log("Sto girando lato SERVER");
  }
  if (process.client) {
    console.log("Sto girando lato CLIENT");
  }

  const url = useRequestURL();
  const host = url.origin;
  console.log("SONO DENTROOOOO" + email + password);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${host}/profile`
    }
  });
  console.log(data, error);

  if (error) {
    console.error("Errore nella registrazione:", error.message);
  } else {
    console.log("Registrazione avvenuta! Email di conferma inviata.");
  }
}

const togglePassword = () => {
  console.log("Toggling password visibility");
  showPassword.value = !showPassword.value;
  console.log("Password visibility:", showPassword);
};
</script>

<style scoped>
/* Stili personalizzati opzionali */
</style>