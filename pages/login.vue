<template>
  <div class="position-relative vh-100">
    <a href="/" class="btn btn-primary rounded-circle position-absolute top-0 start-0 m-4">
      <i class="bi bi-arrow-left"></i>
    </a>
    <div class="d-flex flex-column justify-content-center align-items-center h-100 px-5 px-md-5">
      <h1 class="text-center mb-4">Login</h1>
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
        <button type="submit" class="btn btn-primary w-100 mb-3">Login</button>
        <div class="d-flex justify-content-between mb-3">
          <a href="/forgot_password" class="text-decoration-none">Forgot password?</a>
          <a href="/signup" class="text-decoration-none">Sign up</a>
        </div>
        <hr>
        <button disabled type="button" class="btn btn-outline-primary w-100">Log in with Google</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const supabase = useSupabaseClient()
const email = ref<string>('');
const password = ref<string>('');
const showPassword = ref<boolean>(false);

const togglePassword = () => {
  console.log("Toggling password visibility");
  showPassword.value = !showPassword.value;
  console.log("Password visibility:", showPassword);
};

function handleSubmit() {
  console.log('Email:', email.value);
  console.log('Password:', password.value);
  signInWithEmail(email.value, password.value);
}

async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Errore nel login:", error.message);
  } else {
    console.log("Login riuscito!", data);
    router.push('/profile');
  }
}

</script>

<style scoped>
/* Stili personalizzati opzionali */
</style>