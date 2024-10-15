<template>
  <div class="discovery-search-container">
    <Search />
  </div>
</template>

<style scoped>
.discovery-search-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  border-left: none;
}

@media (min-width: 1200px){
  .discovery-search-container {
    display: none;
  }
}
</style>
