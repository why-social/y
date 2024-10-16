<template>
  <div id="navbar">
    <div class="nav-logo cool-font" @click="$router.push({ path: '/' })">
      <p>𝕐</p>
    </div>

    <hr />

    <NavigationItem to="/" icon="home" text="Home" />
    <NavigationItem to="/discover" icon="search" text="Discover" />
    <NavigationItem to="/profile/me" icon="person" text="Profile" />

    <hr />

    <NavigationItem @click="this.logout()" icon="logout" text="Logout" />

    <div class="buttons" style="margin-top: auto">
      <Button v-if="isAdmin" class="nuke" v-b-modal.confirm-nuke>
        <span
          class="nav-icon material-symbols-outlined"
          style="font-variation-settings: 'wght' 400"
        >
          local_fire_department
        </span>

        <span class="nav-label inter-tight-medium">LET IT BURN</span>
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
import VueJwtDecode from 'vue-jwt-decode'
import { Api } from '@/Api'

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
      await Api.delete('v1/posts', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
      location.reload()
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
      return decoded.isAdmin
    }
  }
}
</script>

<style>
#confirm-nuke {
  --bs-modal-header-border-color: var(--color-border) !important;
  --bs-modal-footer-border-color: var(--color-border) !important;
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
  background-color: #282828;
  border-radius: 1rem;
}
</style>

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

button {
  margin: 0.5rem 0;
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

.nuke {
  background: var(--bs-red);
  border: 2px solid var(--bs-red);
}

.nuke:hover,
.nuke:active,
.nuke:focus {
  background: #df4654;
  border: 2px solid #df4654;
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
