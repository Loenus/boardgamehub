<template>
  <div class="position-relative vh-100">
    <div class="d-flex flex-column justify-content-center align-items-center h-100 px-5 px-md-5">
      <h1 class="text-center mb-4">Set a new password</h1>
      <form @submit.prevent="handleSubmit" class="w-100" style="max-width: 400px;">
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
        <button type="submit" class="btn btn-primary w-100 mb-3">Reset & Login</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const supabase = useSupabaseClient()

const showPassword = ref<boolean>(false);
  const togglePassword = () => {
  console.log("Toggling password visibility");
  showPassword.value = !showPassword.value;
  console.log("Password visibility:", showPassword);
};

const password = ref<string>('');
const confirmPassword = ref<string>(''); 
function handleSubmit() {
  console.log('Password:', password.value);
  console.log('Confirm password:', confirmPassword.value);
  if (password.value !== confirmPassword.value) {
    alert('le due password non sono uguali')
    return;
  }

  updateUserPassword(password.value);
}
async function updateUserPassword(new_password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: new_password
  })

  if (error) {
    console.error("Errore nel login:", error.message);
  } else {
    console.log("Login riuscito!", data);
    router.push('/profile');
  }
}
</script>

<style>

</style>