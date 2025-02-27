<template>
  <nav class="navbar">
    <div class="navbar-left">
      <NuxtLink to="/" class="nav-brand">Nuxt</NuxtLink>
      <div class="nav-items">
        <NuxtLink to="/nuxt" class="nav-item">Nuxt</NuxtLink>
        <NuxtLink to="/nuxthub" class="nav-item">NuxtHub</NuxtLink>
        <NuxtLink to="/nuxtlabs" class="nav-item">NuxtLabs</NuxtLink>
      </div>
    </div>

    <div class="navbar-right">
      <div class="team-actions">
        <button class="team-button" @click="showDropdown = !showDropdown">
          Teams ▼
        </button>
        <div v-if="showDropdown" class="dropdown-menu">
          <NuxtLink to="/create-team" class="dropdown-item">Create team</NuxtLink>
          <NuxtLink to="/manage-teams" class="dropdown-item">Manage teams</NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      showDropdown: false
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00C58E; /* Colore brand Nuxt */
  text-decoration: none;
}

.nav-items {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  color: #2d3748;
  text-decoration: none;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #00C58E;
}

.team-actions {
  position: relative;
}

.team-button {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.team-button:hover {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-top: 0.5rem;
  min-width: 180px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #4a5568;
  text-decoration: none;
  transition: background 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f7fafc;
}
</style>