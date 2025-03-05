<template>
  <button class="btn btn-primary mt-3 ms-3" @click="signOut">
    Sign out
  </button>
  <div class="container mt-5" style="padding-bottom: 50px">
    <h1 class="text-center">{{ userEmail }}</h1>
    
    <div class="mt-5 container">
      <h2 class="mb-3">Teams</h2>
      <div class="w-50 mx-auto">
        <input 
          v-model="teamName" 
          type="text" 
          class="form-control mb-3"
          placeholder="Enter team name"
        />
        <div class="d-flex gap-2">
          <button @click="createTeam" class="btn btn-primary w-50">Create</button>
          <button @click="joinTeam" class="btn btn-success w-50">Join</button>
        </div>
        <ul class="list-group mt-4 w-100">
          <li v-for="team in teams" :key="team.team_id" class="list-group-item w-100">
            <NuxtLink :to="`/team/${team.team_id}`" class="text-decoration-none">
              {{ team.team_name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="mt-5 container">
      <h2 class="mb-3">Collection</h2>

      <!-- Aggiungi un nuovo gioco -->
      <div class="container mb-3 mt-4 position-relative">
        <h5>Aggiungi un gioco</h5>

        <!-- Input di ricerca con icona -->
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i> <!-- Icona di ricerca -->
          </span>
          <input 
            v-model="searchQuery"
            placeholder="Enter game title"
            class="form-control"
            @focus="showDropdown = true"
            @input="handleInput"
            @blur="hideDropdown"
          />
          <span v-if="loadingSearch" class="input-group-text">
            <div class="spinner-border spinner-border-sm text-primary"></div> <!-- Loader -->
          </span>
        </div>

        <!-- Dropdown con i risultati -->
        <ul v-if="showDropdown && gamesBGG.length" class="dropdown-menu show w-100">
          <li v-for="game in gamesBGG" :key="game.id" class="dropdown-item d-flex align-items-center">
            <!-- Pulsante "+" spostato a sinistra -->
            <button class="btn btn-sm btn-primary me-2" @click="addGameToCollection(game.id)">
              +
            </button>
            
            <a :href="'https://boardgamegeek.com/boardgame/' + game.id" target="_blank" class="text-decoration-none">
              <strong>{{ game.name }}</strong> ({{ game.year }})
            </a>
          </li>
        </ul>

        <p v-if="showDropdown && searchQuery && !gamesBGG.length && !loadingSearch" class="text-muted mt-2">No results found.</p>
      </div>

      <!-- import from BGG -->
      <div class="d-flex align-items-center w-100">
        <span class="me-2 text-nowrap">Search <br> BGG user:</span> <!-- Il testo ha la sua dimensione naturale -->
        <input type="text" 
          class="form-control flex-grow-1 me-2"
          v-model="username"
          placeholder="Enter BGG username"
          @keyup.enter="fetchCollection"
        /> <!-- 60% dello spazio -->
        <button @click="fetchCollection" class="btn btn-primary flex-grow-0" style="width: 40%;">
          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
          Import Collection
        </button> <!-- 40% dello spazio -->
      </div>

      <hr>
      
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

      <!-- Filtro per nome -->
      <div class="mb-3 col-12 col-md-6">
        <label for="nameFilter" class="form-label">Filtra per nome:</label>
        <input
          id="nameFilter"
          type="text"
          class="form-control"
          v-model="nameFilter"
          placeholder="Cerca per nome"
        />
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
import debounce from 'lodash/debounce';
const searchQuery = ref('');
const gamesBGG = ref([]);
const showDropdown = ref(false);
const loadingSearch = ref(false);
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
    await fetchTeams();
  }
});


/* TEAMS */
const teamName = ref('');
interface Team {
  id: number;
  name: string
}
const teams = ref<Team[]>([]);

async function createTeam() {
  console.log(teamName.value)
  if (teamName.value === null) return;
  const nameTeam = teamName.value;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      return;
    }

    const token = session.access_token;
    const response = await $fetch<{ status: number; body: any }>('/api/add-team', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nameTeam })
    });

    if (response.status !== 200) {
      error.value = response.body.error;
    } else {
      console.log('Team member aggiunto con successo:', response.body.data);
      await fetchTeams();
    }
  } catch (err) {
    error.value = 'Errore durante l\'aggiunta del rating';
  }
}

async function joinTeam() {
  console.log(teamName.value)
  if (teamName.value === null) return;
  const nameTeam = teamName.value;
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      return;
    }

    const token = session.access_token;
    const response = await $fetch<{ status: number; body: any }>('/api/join-team', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nameTeam })
    });

    if (response.status !== 200) {
      error.value = response.body.error;
      alert(error.value)
    } else {
      console.log('Team member aggiunto con successo:', response.body.data);
      await fetchTeams();
    }
  } catch (err) {
    error.value = 'Errore durante l\'aggiunta del rating';
  }
}

async function fetchTeams() {
  try {
    errorMessage.value = '';
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      return;
    }

    const token = session.access_token;
    const response = await $fetch<{ status: number; body: any }>('/api/retrieve-user-teams', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.status !== 200) {
      error.value = "errrorrrr";
    } else {
      console.log(response.body);
      teams.value = response.body;
    }
    console.log(teams.value)
    
  } catch (err) {
    error.value = "error";
  }
}



/* IMPORT BGG COLLECTION */

const username = ref('');
const fetchCollection = async () => {
  if (!username.value) {
    alert('Inserisci un username!');
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      loading.value = false;
      return;
    }

    const token = session.access_token;
    const response = await $fetch(`/api/bgg-import-collection?username=${username.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    //games.value = response.data || [];
    if (!response.success) {
      alert('cìè stato un errore nel backend');
    } else {
      alert('collection di '+ username.value +' recuperata correttamente!');
      await fetchGames(); // Ricarica la lista dei giochi per aggiornare il possesso
    }
  } catch (error) {
    errorMessage.value = 'Errore nel recupero dei dati';
    console.log(error);
    alert(error);
    games.value = [];
  } finally {
    loading.value = false;
  }
}


/* FILTRI */

const selectedPlayers = ref<(number | string)[]>([]); // Supporta sia numeri che la stringa '12+'
const nameFilter = ref('');

// Trova il numero massimo di giocatori tra i giochi
const maxPlayers = computed(() => Math.max(...games.value.map(game => game.max_players), 0));

// Filtro dei giochi in base alla selezione
const filteredGames = computed(() => {
  let filtered = games.value;

  // Filtro per il nome
  if (nameFilter.value) {
  filtered = filtered.filter(game =>
      game.name.toLowerCase().includes(nameFilter.value.toLowerCase())
    );
  }

  // Filtro per il numero di giocatori
  if (selectedPlayers.value !== null) {
    filtered = filtered.filter(game => {
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
  }

  return filtered;
});


/* AGGIUNGI GIOCO */

// Funzione per aggiungere il gioco alla collezione
async function addGameToCollection(gameId: number) {
  try {
    console.log('ENTRATOOOO con gameId: ', gameId);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      errorMessage.value = 'Token non disponibile. Effettua il login.';
      return;
    }

    const token = session.access_token;
    const response = await $fetch<{ status: number; body: any }>('/api/add-game', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gameId })
    });
    
    if (response.status !== 200) {
      error.value = response.body.error;
    } else {
      console.log('Gioco aggiunto con successo:', response.body.data);
      await fetchGames(); // Ricarica la lista dei giochi per aggiornare il possesso
    }
  } catch (error) {
    console.error("Errore nell'aggiungere il gioco", error);
    alert('Si è verificato un errore.');
  }
}

// Funzione per cercare giochi su BGG con debounce
const searchGame = debounce(async () => {
  if (!searchQuery.value) {
    gamesBGG.value = [];
    showDropdown.value = false;
    return;
  }
  
  loadingSearch.value = true;
  const { data } = await useFetch(`/api/bgg-search?title=${searchQuery.value}`);

  if (data.value?.games) {
    gamesBGG.value = data.value.games;
  } else {
    gamesBGG.value = [];
  }

  loadingSearch.value = false;
}, 650); // Aspetta Xms prima di eseguire la richiesta API

// Gestione dell'input
const handleInput = () => {
  showDropdown.value = true;
  searchGame();
};

// Nasconde il dropdown se si clicca fuori
const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};


/* PRIMA PARTE */

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