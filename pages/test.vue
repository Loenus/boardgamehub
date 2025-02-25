<template>
  <div>
    accessibile solo se loggedin
  </div>
  <button class="btn btn-primary" @click="signOut">
      Sign out
    </button>
</template>

<script lang="ts" setup>

const supabase = useSupabaseClient()
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.log(error)
}

</script>

<style>

</style>