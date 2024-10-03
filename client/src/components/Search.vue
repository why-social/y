<template>
  <div id="search">
    <Input icon="search" type="text"/>
  </div>
</template>

<script>
</script>

<style scoped>
#search {
  padding: 20px;
  box-sizing: border-box;
  border-left: none;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1200px) {
  #search {
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 40px;
    box-sizing: border-box;
    border-left: 1px solid var(--color-border);
    position: fixed;
  }

  #search {
    border-left: 1px solid var(--color-border);
  }

  .input-container {
    width: 18rem;
  }
}

@media (min-width: 1600px) {
  .input-container {
    width: 24rem;
  }
}
</style>
