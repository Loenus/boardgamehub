<template>
  <div>
    <button class="btn btn-primary" @click="signOut">
      Sign out
    </button>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter()
const supabase = useSupabaseClient()

onMounted(() => {
  if (route.query.code) {
    // Rimuove "code" dall'URL senza ricaricare la pagina
    router.replace({ path: route.path });
  }
});

async function signOut() {
  console.log("SIGNING OUT")
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Errore nel logout:", error.message);
  } else {
    console.log("Logout riuscito!");
    router.push('/');
  }
}

</script>

<style>

</style>