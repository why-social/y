<template>
  <b-container class="d-flex">
    <div class="nav-container">
      <Navigation />
    </div>

    <div class="divider"></div>

    <div class="search-content-container">
      <div id="content-container">
        <router-view :key="$route.fullPath" />
      </div>

      <div class="divider"></div>

      <div id="search-container">
        <Search />
      </div>
    </div>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      isLoaded: false
    }
  }
}
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
}

.nav-container {
  box-sizing: border-box;
  position: sticky;
  height: 100vh;
  top: 0;
  width: fit-content;
  bottom: unset;
}

.search-content-container {
  display: flex;
  width: 100%;
}

#content-container {
  flex: 1;
  min-height: 100vh;
  box-sizing: border-box;
}

#search-container {
  min-height: 100vh;
  height: 100%;
  width: fit-content;
  overflow: hidden;
  box-sizing: border-box;
  display: none;
}

.divider {
  position: sticky;
  top: 0;
  width: 1px;
  display: none;
  background: var(--color-border);
}

.container .divider {
  display: unset;
}

@media (max-width: 630px) {
  .container {
    max-width: 100%;
  }

  .nav-container {
    width: 100%;
    height: fit-content;
    top: unset;
    bottom: 0;
    position: fixed;
    z-index: 100000;
  }

  .container .divider {
    display: none;
  }
}

/* s (small screens, 768px and up) */
@media (min-width: 768px) {
  .container {
    max-width: unset;
  }
}

@media (min-width: 820px) {
  .container {
    max-width: 820px;
  }

  .search-content-container .divider {
    display: unset;
  }
}

/* l (large desktops, 992px and up) */
@media (min-width: 992px) {
  .container {
    max-width: 820px;
  }
}

/* xl (extra large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .container {
    max-width: 1160px;
  }

  #search-container {
    width: 20rem;
    display: inherit;
  }
}

/* xxl - bootstrap does not support */
@media (min-width: 1400px) {
  .container {
    max-width: 1340px;
  }

  #search-container {
    width: 24rem;
  }
}

/* xxxl - bootstrap does not support */
@media (min-width: 1600px) {
  .container {
    max-width: 1540px;
  }
  #search-container {
    width: 28rem;
  }
}
</style>
