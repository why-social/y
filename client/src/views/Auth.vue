<template>
  <div class="login-root">
    <div class="logo-container">
      <p class="logo cool-font">𝕐</p>
    </div>
    <div class="login-container">
      <div class="login-form">
        <h1 class="inter-tight-bold pun" ref="pun"></h1>
        <b-col no-gutter>
          <router-view />
        </b-col>
      </div>
    </div>
  </div>
</template>

<script scoped>
const puns = [
  'did <span class="cool-font">𝕏</span> go to therapy? Too many exes…',
  'are we still here… Just to suffer…',
  'is there always one sock missing after laundry?',
  'is it so hard to open a bag of chips quietly?',
  'do we park in driveways and drive on parkways?',
  'does the toast always land butter&#8209;side down?'
]

export default {
  mounted() {
    this.$refs.pun.innerHTML = puns[Math.floor(Math.random() * puns.length)]
  }
}
</script>

<style scoped>
.login-root {
  pointer-events: all;
  box-sizing: border-box;
  height: fit-content;
  width: 100%;
  display: flex;
  flex-direction: row;
}

.login-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 30rem;
  gap: 3rem;
}

.logo-container {
  height: 100vh;
  position: sticky;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  top: 0;
}

.logo {
  margin: 0;
  flex-grow: 1;
  text-align: center;
  font-size: 30vw;
}

.pun {
  font-size: 3rem;
}

/* Large devices (large desktops, 992px and up) */
@media (max-width: 992px) {
  .login-root {
    flex-direction: column;
  }

  .login-container {
    width: 100%;
    justify-content: center;
  }

  .logo-container {
    margin-top: 2rem;
    margin-bottom: -2rem;
    height: fit-content;
    position: relative;
  }

  .logo {
    left: 25%;
    flex-grow: 0;
    font-size: 10rem;
    text-align: start;
  }
}
</style>
