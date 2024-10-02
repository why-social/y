<template>
  <div id="navbar">
    <a href="#"> <img class="logo" src="/favicon.ico" alt="" /> </a>
    <NavigationItem to="/" text="Home"> </NavigationItem>
    <NavigationItem to="/post" text="Post"> </NavigationItem>
  </div>
</template>

<script>
</script>

<style>
#navbar {
  height: 100vh;
  position: sticky;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  top: 0;
  flex: 0 0 15rem;
}

.logo {
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
</style>
