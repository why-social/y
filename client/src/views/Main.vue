<template>
  <b-container class="d-flex">
    <div class="nav-container">
      <Navigation />
    </div>
    <div class="search-content-container">
      <router-view />
      <div class="search-container">
        <Search />
      </div>
    </div>
  </b-container>
</template>

<style scoped>
.container {
  padding-left: 0;
  padding-right: 0;
}

.nav-container {
  min-height: 100vh;
  box-sizing: border-box;
  display: relative;
  padding-right: calc(4.4rem + 40px);
}

.search-content-container {
  display: flex;
  overflow: hidden;
}

.search-container {
  min-height: 100vh;
  box-sizing: border-box;
  display: none;
  padding-right: 0;
}

/* god bless */
@media (max-width: 630px) {
  .nav-container {
    padding-right: 0;
    position: fixed;
    z-index: 100000;
  }
}

@media (max-width: 768px) {
  .container {
    max-width: 100%;
  }
}

/* s (small screens, 768px and up) */
@media (min-width: 768px) {
  .container {
    max-width: 808px;
    margin: 0;
  }
}

/* l (large desktops, 992px and up) */
@media (min-width: 992px) {
  .container {
    max-width: 808px;
  }
}

/* xl (extra large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .container {
    max-width: 1160px;
  }

  .search-container {
    padding-right: calc(18rem + 40px);
    display: inherit;
  }
}

/* xxl - bootstrap does not support */
@media (min-width: 1400px) {
  .container {
    max-width: 1340px;
  }

  .nav-container {
    padding-right: calc(13rem + 60px);
  }
}

/* xxxl - bootstrap does not support */
@media (min-width: 1600px) {
  .container {
    max-width: 1540px;
  }

  .search-container {
    padding-right: calc(24rem + 40px);
  }
}
</style>
