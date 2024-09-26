<template>
  <div id="app">
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
</style>
