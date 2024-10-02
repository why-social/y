<template>
  <div id="navbar">
    <a href="#"> <img class="logo" src="/favicon.ico" alt="" /> </a>
    <NavBarItem to="/" text="Home"> </NavBarItem>
    <NavBarItem to="/profile/me" text="My profile"> </NavBarItem>
    <NavBarItem to="/" text="Test"> </NavBarItem>
  </div>
</template>

<script>
</script>

<style>
#navbar {
  width: 20rem;
  height: 100vh;
  position: sticky;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  top: 0;
}

.logo {
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
</style>
