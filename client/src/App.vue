<template>
  <div id="app">
    <b-container fluid>
      <b-row>
        <b-col>
          <a href="#"> <img class="logo" src="/favicon.ico" alt=""> </a>
          <b-nav vertical align="right">
            <b-nav-item to="/">Home</b-nav-item>
            <b-nav-item to="/">Home</b-nav-item>
            <b-nav-item to="/">Home</b-nav-item>
          </b-nav>
        </b-col>
        <b-col cols="6" class="center">
          test
        </b-col>
        <b-col>
          test
        </b-col>
      </b-row>
    </b-container>
    <router-view />
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  /* display: flex; */
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: black;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.logo {
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
</style>
