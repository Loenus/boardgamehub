<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')

const url = useRequestURL();
const host = url.origin;
const signInWithOtp = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: `${host}/confirm`,
    }
  })
  if (error) console.log(error)
}
</script>

<template>
  <div>
    <button class="btn btn-primary" @click="signInWithOtp">
      Sign In with E-Mail
    </button>
    <input
      v-model="email"
      type="email"
    />
  </div>
</template>
