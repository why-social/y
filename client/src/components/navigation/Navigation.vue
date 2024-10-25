<script setup>
import VueJwtDecode from 'vue-jwt-decode'
import { Api } from '@/Api'

import NavigationItem from '@/components/navigation/NavigationItem.vue'
import Button from '@/components/misc/Button.vue'
</script>

<template>
  <div id="navbar">
    <div class="nav-logo cool-font" @click="$router.push({ path: '/' })">
      <p>𝕐</p>
    </div>

    <hr />

    <NavigationItem
      to="/"
      icon="home"
      :class="{ filled: isHome }"
      text="Home"
    />
    <NavigationItem
      to="/discover"
      icon="search"
      text="Discover"
      id="nav-discover"
    />
    <NavigationItem
      to="/profile/me"
      icon="person"
      :class="{ filled: isProfile }"
      text="Profile"
    />

    <hr />

    <NavigationItem @click="logout" icon="logout" text="Logout" />

    <div class="buttons" style="margin-top: auto">
      <Button v-if="isAdmin" class="nuke" v-b-modal.confirm-nuke>
        <span
          class="nav-icon material-symbols-outlined"
          style="font-variation-settings: 'wght' 400"
        >
          bomb
        </span>

        <span class="nav-label inter-tight-medium">NUKE IT</span>
      </Button>

      <Button @click="redirectToPost">
        <span
          class="nav-icon material-symbols-outlined"
          style="font-variation-settings: 'wght' 400"
          >history_edu</span
        >

        <span class="nav-label inter-tight-medium">Post</span>
      </Button>
    </div>

    <b-modal
      ref="confirmNuke"
      id="confirm-nuke"
      centered
      title="Are you sure?"
      header-class="musk-header"
      dialog-class="musk-dialog"
      ok-title="Nuke it!"
      ok-variant="danger"
      cancel-title="No, I want my mommy"
      @ok="nuke"
    >
      <img src="@/img/elon-musk-dance.gif" class="img-fluid" />
    </b-modal>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem('token')
      this.$router.push({ path: '/login' })
    },

    closeModal() {
      this.$refs.confirmNuke.hide('confirm-nuke')
    },

    async nuke() {
      this.closeModal()
      const authHeader = {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
      await Api.delete('v1/posts', { headers: authHeader })
      await Api.delete('v1/users', { headers: authHeader })

      await this.$nextTick()
      this.$router.go()
    },

    redirectToPost() {
      const route = {
        query: {
          focus: true
        }
      }

      if (!this.$route.path.startsWith('/home')) {
        route.path = '/home/feed'
      }

      this.$router.replace(route)
    }
  },
  computed: {
    isAdmin: () => {
      const decoded = VueJwtDecode.decode(localStorage.getItem('token'))
      return !!decoded.adminKey
    },

    isHome() {
      return this.$route.path.startsWith('/home')
    },

    isProfile() {
      return this.$route.path.startsWith('/profile')
    }
  }
}
</script>

<style>
#confirm-nuke {
  --bs-modal-header-border-color: var(--color-background-highlight) !important;
  --bs-modal-footer-border-color: var(--color-background-highlight) !important;
  background: rgba(0, 0, 0, 0.6);
  pointer-events: all;
  backdrop-filter: blur(4px);
}

.musk-header {
  color: white;
}

.musk-header .btn-close {
  --bs-btn-close-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
}

.musk-dialog {
  width: fit-content !important;
  max-width: none !important;
}

.musk-dialog .modal-content {
  border: 1px solid var(--color-background-highlight);
  box-shadow: 0 0 0.2rem var(--color-background-highlight),
    0 0 1rem var(--color-background-highlight);
  background-color: var(--color-background);
  border-radius: 1rem;
}
</style>

<style scoped>
#navbar {
  pointer-events: all;
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
}

hr {
  display: block;
}

button {
  margin: 0.5rem 0;
  width: 100%;
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

.buttons {
  display: flex;
  flex-direction: column;
}

.nuke {
  background: var(--bs-red);
  border: 2px solid var(--bs-red);
}

.nuke:hover,
.nuke:active,
.nuke:focus {
  background: var(--color-error);
  border: 2px solid var(--color-error);
}

.filled * {
  font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 10 !important;
}

/* god bless */
@media (max-width: 630px) {
  #navbar {
    width: 100%;
    min-width: 375px;
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

  .buttons {
    position: absolute;
    right: 8%;
    bottom: 120%;
  }

  button {
    width: 4.2rem;
    height: 4.2rem;
    filter: drop-shadow(0px 0px 10px #000000);
  }

  .nuke {
    display: none;
  }
}

@media (min-width: 1200px) {
  #nav-discover {
    display: none;
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
