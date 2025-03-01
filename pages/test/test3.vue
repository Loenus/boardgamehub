<template>
  <div class="container mt-4">
    <h2>Importa la tua collezione BGG</h2>

    <!-- Input per il nome utente -->
    <input 
      v-model="username"
      placeholder="Inserisci username BGG"
      class="form-control"
      @keyup.enter="fetchCollection"
    />

    <!-- Pulsante per cercare -->
    <button @click="fetchCollection" class="btn btn-primary mt-2">
      <span v-if="loading" class="spinner-border spinner-border-sm"></span>
      Cerca
    </button>

    <!-- Lista giochi -->
    <ul v-if="games.length" class="list-group mt-3">
      <li v-for="game in games" :key="game.id" class="list-group-item">
        <a :href="game.bgg_url" target="_blank">{{ game.name }}</a>
      </li>
    </ul>

    <!-- Messaggi di stato -->
    <p v-if="loading" class="text-muted mt-2">Caricamento...</p>
    <p v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
    <p v-if="!loading && !games.length && !errorMessage && searched" class="text-muted mt-2">
      Nessun gioco trovato per questo utente.
    </p>
  </div>
</template>

<script setup>
const username = ref('');
const games = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const searched = ref(false);

const supabase = useSupabaseClient();

const fetchCollection = async () => {
  if (!username.value) {
    errorMessage.value = 'Inserisci un username!';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  searched.value = true;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      loading.value = false;
      return;
    }

    const token = session.access_token;
    //console.log(token);

    const response = await $fetch(`/api/bgg-import-collection?username=${username.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    games.value = response.data || [];
  } catch (error) {
    errorMessage.value = 'Errore nel recupero dei dati';
    console.log(error);
    games.value = [];
  } finally {
    loading.value = false;
  }
};
</script>

<style>
.container {
  max-width: 500px;
  margin: auto;
}
</style>
