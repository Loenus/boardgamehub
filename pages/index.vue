<template>
  <div class="container mt-4">
    <h2>Search Board Games</h2>
    <input v-model="searchQuery" placeholder="Enter game title" class="form-control" @keyup.enter="searchGame">
    <button @click="searchGame" class="btn btn-primary mt-2">Search</button>

    <div v-if="games.length" class="mt-3">
      <h3>Results:</h3>
      <ul class="list-group">
        <li v-for="game in games" :key="game.id" class="list-group-item">
          <strong>{{ game.name }}</strong> ({{ game.year }})
          <a :href="'https://boardgamegeek.com/boardgame/' + game.id" target="_blank">View on BGG</a>
        </li>
      </ul>
    </div>

    <p v-else-if="searchQuery && !loading">No results found.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
const games = ref([]);
const loading = ref(false);

const searchGame = async () => {
  if (!searchQuery.value) return;
  loading.value = true;

  const { data, error } = await useFetch(`/api/bgg-search?title=${searchQuery.value}`);

  if (data.value?.games) {
    games.value = data.value.games;
  } else {
    games.value = [];
  }

  loading.value = false;
};
</script>

<style>
.container {
  max-width: 500px;
  margin: auto;
}
</style>
