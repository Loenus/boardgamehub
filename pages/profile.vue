<template>
  <button class="btn btn-primary mt-3 ms-3" @click="signOut">
    Sign out
  </button>
  <div class="container mt-5">
    <h1 class="text-center">{{ userEmail }}</h1>
    <div class="mt-5 container">
      <h2 class="mb-3">Collection</h2>
      
      <div v-if="loading" class="text-secondary">Caricamento...</div>
      <div v-else-if="error" class="text-danger">Errore: {{ error }}</div>

      <ul v-else class="list-group">
        <li 
          v-for="(game, index) in games" 
          :key="game.bgg_id"
          class="list-group-item d-flex justify-content-between align-items-center border-bottom">
          <div>
            <p class="mb-1 fw-semibold">{{ game.name }}</p>
            <small class="text-muted">{{ game.min_players }} - {{ game.max_players }} giocatori</small>
          </div>
          <span v-if="game.rating !== null" class="badge bg-warning text-dark">
            ⭐ {{ game.rating }}
          </span>
          <button v-else class="btn btn-outline-primary btn-sm" @click="addRating(game.bgg_id)">+</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router';

interface Game {
  bgg_id: number;
  name: string;
  min_players: number;
  max_players: number;
  rating: number | null;
}

const router = useRouter();
const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const userEmail = ref<string | null | undefined>(null);
const games = ref<Game[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  if (route.query.code) {
    // Rimuove "code" dall'URL senza ricaricare la pagina
    router.replace({ path: route.path });
 }

  if (user.value) {
    userEmail.value = user.value.email;
    await fetchGames();
  }
});

const errorMessage = ref('');

async function fetchGames() {
  try {
    errorMessage.value = '';
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      loading.value = false;
      return;
    }

    const token = session.access_token;
    const response = await $fetch<{ status: number; body: any }>('/api/retrieve-user-games', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.status !== 200) {
      error.value = "errrorrrr";
    } else {
      console.log(response.body);
      games.value = response.body;
    }
    
  } catch (err) {
    error.value = "error";
  } finally {
    loading.value = false;
  }
}

async function signOut() {
  console.log('SIGNING OUT');
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Errore nel logout:', error.message);
  } else {
    console.log('Logout riuscito!');
    router.push('/');
  }
}

async function addRating(bgg_id: number) {
  console.log(`Add rating for game with bgg_id: ${bgg_id}`);
  const rating = prompt('Inserisci il tuo rating (0-10):');
  if (rating === null) return;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      return;
    }

    const token = session.access_token;
    const response = await $fetch<{ status: number; body: any }>('/api/add-rating', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bgg_id, rating: parseFloat(rating) })
    });

    if (response.status !== 200) {
      error.value = response.body.error;
    } else {
      console.log('Rating aggiunto con successo:', response.body.data);
      await fetchGames(); // Ricarica la lista dei giochi per aggiornare il rating
    }
  } catch (err) {
    error.value = 'Errore durante l\'aggiunta del rating';
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}
</style>