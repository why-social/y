<template>
  <div id="navbar">
    <div class="nav-logo cool-font" @click="$router.push({ path: '/' })">
      <p>𝕐</p>
    </div>
    <hr>
    <NavigationItem to="/" icon="home" text="Home"> </NavigationItem>
    <NavigationItem to="/discover" icon="search" text="Discover">
    </NavigationItem>
    <NavigationItem
      to="/profile/me"
      icon="person"
      text="Profile"
    ></NavigationItem>
    <hr>
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
  padding: 20px;
  box-sizing: border-box;
  border-right: 1px solid var(--color-border);
  height: 100%;
  position: fixed;
  display: flex;
  flex-direction: column;
}

hr {
  display: block;
}

.nav-logo {
  user-select: none;
  width: fit-content;
  font-size: 3rem;
  border-radius: 100vmax;
  padding: 1.2rem;
  transition: 0.3s;
  line-height: 60%;
}

.nav-logo p {
  margin: 0;
  transform: translateY(10%);
}

.nav-logo:hover {
  cursor: pointer;
  background: var(--color-background-highlight);
}

.nav-icon {
  font-size: 2.5rem;
  display: flex;
  width: 2rem;
  height: 2.7rem;
  align-items: center;
  justify-content: center;
}

.nav-label {
  display: none;
}

/* god bless */
@media (max-width: 630px) {
  #navbar {
    width: 100%;
    height: fit-content;
    flex-direction: row;
    border-top: 1px solid var(--color-border);
    border-right: none;
    bottom: 0;
    padding: 10px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  #navbar > * {
    margin-left: auto;
    margin-right: auto;
  }

  .nav-logo {
    display: none;
  }

  hr {
    display: none;
  }

  button {
    position: absolute;
    right: 8%;
    width: 4.2rem;
    height: 4.2rem;
    bottom: 120%;
    filter: drop-shadow(0px 0px 10px #000000);
  }
}

@media (min-width: 1400px) {
  #navbar {
    padding-right: 40px;
  }

  .nav-icon {
    height: 2rem;
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

      this.$router.push({ path: '/login' })
    }
  }
}
</script>
