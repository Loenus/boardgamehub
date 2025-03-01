<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-dark">
    <div class="card p-4 text-light bg-secondary" style="width: 400px; border-radius: 10px;">
      <h3 class="text-center">Create an account</h3>
      <p class="text-center">
        Already have an account? <a href="/login" class="text-info">Login</a>.
      </p>
      
      <button class="btn btn-outline-light w-100 mb-2">
        <i class="bi bi-google"></i> Google
      </button>
      <button class="btn btn-outline-light w-100 mb-3">
        <i class="bi bi-github"></i> GitHub
      </button>

      <div class="text-center text-light my-2">or</div>

      <form @submit.prevent="register">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="name" type="text" class="form-control" placeholder="Enter your name">
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="Enter your email">
        </div>

        <div class="mb-3">
          <label class="form-label">Password</label>
          <div class="input-group">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control" placeholder="Enter your password">
            <button class="btn btn-outline-light" type="button" @click="togglePassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100">Create account</button>
      </form>

      <p class="text-center mt-3">
        By signing up, you agree to our <a href="#" class="text-info">Terms of Service</a>.
      </p>
    </div>
  </div>
</template>

<script>
const supabase = useSupabaseClient();

const signUp = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: 'http://localhost:3000/confirm',
    }
  })
  if (error) console.log(error)
}

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      showPassword: false,
    };
  },
  methods: {
    async register() {
      console.log("Registering:", this.name, this.email, this.password);
      let { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password
      })
      if (error) console.log(error);
      console.log(data);
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    }
  }
};
</script>

<style>
.card {
  background-color: #1e1e2f !important;
}
</style>
