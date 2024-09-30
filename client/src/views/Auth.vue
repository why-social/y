<template>
  <div class="login-root">
    <p class="logo cool-font">𝕐</p>
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
  box-sizing: border-box;
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.login-container {
  display: flex;
  width: 50%;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 30rem;
  gap: 3rem;
}

.logo {
  flex-grow: 1;
  text-align: center;
  font-size: 30vw;
  margin-bottom: 0;
  margin-top: 4vw;
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

  .logo {
    left: 25%;
    flex-grow: 0;
    font-size: 10rem;
    text-align: start;
  }
}
</style>
