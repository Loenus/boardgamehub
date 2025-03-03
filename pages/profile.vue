<template>
  <button class="btn btn-primary mt-3 ms-3" @click="signOut">
    Sign out
  </button>
  <div class="container mt-5">
    <h1 class="text-center">{{ userEmail }}</h1>
    <div class="mt-5 container">
      <h2 class="mb-3">Collection</h2>
      
      <!-- Filtro per numero di giocatori -->
      <div class="mb-3">
        <label class="form-label">Filtra per numero di giocatori:</label>
        <div class="d-flex flex-wrap gap-1 justify-content-center">
          <!-- Checkbox numerata da 1 a limitMaxPlayerFilter -->
          <label v-for="n in limitMaxPlayerFilter" :key="n" class="btn filter-checkbox" :class="{ active: selectedPlayers.includes(n) }">
            <input type="checkbox" v-model="selectedPlayers" :value="n" class="form-check-input d-none">
            <span class="checkbox-label">{{ n }}</span>
          </label>

          <!-- Checkbox limitMaxPlayerFilter+1 (ad esempio 13+, 14+, ecc.) -->
          <label v-if="maxPlayers > limitMaxPlayerFilter" class="btn filter-checkbox" :class="{ active: selectedPlayers.includes(`${limitMaxPlayerFilter + 1}`) }">
            <input type="checkbox" v-model="selectedPlayers" :value="`${limitMaxPlayerFilter + 1}`" class="form-check-input d-none">
            <span class="checkbox-label">{{ limitMaxPlayerFilter + 1 }}+</span>
          </label>
        </div>
      </div>

      <div v-if="loading" class="text-secondary">Caricamento...</div>
      <div v-else-if="error" class="text-danger">Errore: {{ error }}</div>

      <ul v-else class="list-group">
        <li 
          v-for="(game, index) in filteredGames" 
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
const limitMaxPlayerFilter :number = 12;

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

const selectedPlayers = ref<(number | string)[]>([]); // Supporta sia numeri che la stringa '12+'

// Trova il numero massimo di giocatori tra i giochi
const maxPlayers = computed(() => Math.max(...games.value.map(game => game.max_players), 0));

// Filtro dei giochi in base alla selezione
const filteredGames = computed(() => {
  return games.value.filter(game => {
    // Se la selezione include limitMaxPlayerFilter+1 (verifica se max_players >= limitMaxPlayerFilter+1)
    const isPlusSelected = selectedPlayers.value.includes(`${limitMaxPlayerFilter + 1}`);
    if (isPlusSelected && game.max_players <= limitMaxPlayerFilter) {
      return false;  // Se limitMaxPlayerFilter+1 è selezionato, ma il gioco ha max_players <= limitMaxPlayerFilter, non lo includere
    }

    // Verifica che il gioco soddisfi tutti i numeri selezionati
    return selectedPlayers.value.every(playerCount => {
      if (typeof playerCount === 'number') {
        return playerCount >= game.min_players && playerCount <= game.max_players;
      }
      return true; // Ignora la stringa per il filtro limitMaxPlayerFilter+1
    });
  });
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

/* Personalizza le checkbox per sembrare pulsanti */
.filter-checkbox {
  padding: 8px 16px; /* Spaziatura tra il testo e il bordo della checkbox */
  border-radius: 30px; /* Bordo arrotondato */
  font-weight: bold; /* Testo in grassetto */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
  border: 2px solid #007bff; /* Colore di bordo predefinito */
}

/* Quando la checkbox è selezionata */
.filter-checkbox.active {
  background-color: #007bff; /* Colore di sfondo blu per la selezione */
  border-color: #0056b3; /* Colore del bordo blu scuro */
  color: white; /* Colore del testo bianco */
}

/* Stile quando la checkbox non è selezionata */
.filter-checkbox:not(.active) {
  background-color: white;
  border-color: #007bff; /* Colore di bordo quando non selezionata */
  color: #007bff; /* Colore del testo quando non selezionata */
}

/* Estetica del testo */
.checkbox-label {
  font-size: 14px;
  color: inherit; /* Usa il colore ereditato dal bordo e background */
}

/* Se maxPlayers > 14, per 12+ */
.btn-outline-success.active {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

/* Stile per il layout in orizzontale */
.d-flex {
  overflow-x: auto; /* Scorrimento orizzontale se ci sono troppe checkbox */
}

.d-flex::-webkit-scrollbar {
  height: 8px; /* Dimensione della scrollbar */
}

.d-flex::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}

.d-flex::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}
</style>