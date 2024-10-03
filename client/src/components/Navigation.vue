<template>
  <div id="navbar">
    <div class="nav-logo" @click="$router.push({ path: '/' })">𝕐</div>
    <div class="divider"></div>
    <NavigationItem to="/" icon="home" text="Home"> </NavigationItem>
    <NavigationItem to="/search" icon="search" text="Discover">
    </NavigationItem>
    <NavigationItem
      to="/profile/me"
      icon="person"
      text="Profile"
    ></NavigationItem>
    <div class="divider"></div>
    <NavigationItem @click="this.logout()" icon="logout" text="Logout">
    </NavigationItem>
    <Button @click="$router.push({ path: '/post' })" style="margin-top: auto"
      ><span
        class="nav-icon material-symbols-outlined"
        style="font-variation-settings: 'wght' 400"
        >history_edu</span
      >
      <span class="nav-label inter-tight-medium">Post</span>
    </Button>
  </div>
</template>

<script>
</script>

<style scoped>
#navbar {
  padding-top: 20px;
  padding-bottom: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  border-right: 1px solid var(--color-border);
  height: 100%;
  position: fixed;
  display: flex;
  flex-direction: column;
}

.divider {
  width: 100%;
  height: 1px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  background: var(--color-border);
}

.nav-logo {
  user-select: none;
  width: fit-content;
  font-size: 3rem;
  border-radius: 100vmax;
  padding: 1.2rem;
  transition: 0.3s;
  line-height: 70%;
}

.nav-logo:hover {
  cursor: pointer;
  background: var(--color-background-highlight);
}

.nav-icon {
  font-size: 2.5rem;
  display: flex;
  line-height: 80%;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
}

.nav-label {
  display: none;
}

/* god bless */
@media (max-width: 630px) {
  #navbar {
    position: sticky;
    height: 100vh;
    top: 0;
    left: 0;
  }
}

@media (min-width: 1400px) {
  #navbar {
    padding-right: 40px;
  }

  .nav-label {
    display: flex;
    justify-content: center;
    text-align: center;
    font-size: 1.5rem;
    line-height: 90%;
  }

  button {
    width: 13rem;
    padding: 1rem;
  }
}
</style>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem('token')

      this.$router.push({ path: '/' })
    }
  }
}
</script>
