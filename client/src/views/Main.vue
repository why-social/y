<template>
  <b-container id="container" class="d-flex">
    <Navigation />
    <div class="search-content-container">
      <router-view />
      <Search />
    </div>
  </b-container>
</template>

<style scoped>
.search-content-container {
  display: flex;
  width: 100%;
  overflow: hidden;
}

/* Large devices (large desktops, 992px and up) */
@media (max-width: 992px) {
  .search-content-container {
    flex-direction: column-reverse;
  }
}
</style>
