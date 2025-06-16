<template>
  <div>
    <header class="main-header">
      <h2>Hope Channel HRD Dashboard</h2>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>
<script setup></script>
<style scoped>
.main-header { background: #1e3a8a; color: #fff; padding: 1rem 2rem; margin-bottom: 1rem; }
main { min-height: 80vh; padding: 1rem 2rem; }
</style>
