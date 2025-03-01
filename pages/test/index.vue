<template>
  <div class="container mt-4 position-relative">
    <h2>Search Board Games</h2>

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
      <span v-if="loading" class="input-group-text">
        <div class="spinner-border spinner-border-sm text-primary"></div> <!-- Loader -->
      </span>
    </div>

    <!-- Dropdown con i risultati -->
    <ul v-if="showDropdown && games.length" class="dropdown-menu show w-100">
      <li v-for="game in games" :key="game.id" class="dropdown-item">
        <a :href="'https://boardgamegeek.com/boardgame/' + game.id" target="_blank" class="text-decoration-none">
          <strong>{{ game.name }}</strong> ({{ game.year }})
        </a>
      </li>
    </ul>

    <p v-if="showDropdown && searchQuery && !games.length && !loading" class="text-muted mt-2">No results found.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFetch } from '#app';
import debounce from 'lodash/debounce';

const searchQuery = ref('');
const games = ref([]);
const showDropdown = ref(false);
const loading = ref(false);

// Funzione per cercare giochi su BGG con debounce
const searchGame = debounce(async () => {
  if (!searchQuery.value) {
    games.value = [];
    showDropdown.value = false;
    return;
  }
  
  loading.value = true;
  const { data } = await useFetch(`/api/bgg-search?title=${searchQuery.value}`);

  if (data.value?.games) {
    games.value = data.value.games;
  } else {
    games.value = [];
  }

  loading.value = false;
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
</script>

<style>
.container {
  max-width: 500px;
  margin: auto;
}
.input-group-text {
  background: white;
  border-right: none;
}
.form-control {
  border-left: none;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
}
.dropdown-item {
  cursor: pointer;
}
</style>
