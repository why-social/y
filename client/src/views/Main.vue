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
  overflow: hidden;
}

/* l (large desktops, 992px and up) */
@media (max-width: 992px) {
  .search-content-container {
    flex-direction: column-reverse;
  }
}

/* xxl - bootstrap does not support */
@media (min-width: 1400px) {
  .container {
    max-width: 1340px;
  }
}

/* xxxl - bootstrap does not support */
@media (min-width: 1600px) {
  .container {
    max-width: 1540px;
  }
}
</style>
