<template>
  <div id="search">
    <Input />
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

input {
  width: 100%;
  padding: 0.7rem;
  background: var(--color-background-highlight);
  outline: none;
  border-radius: 100vmax;
  color: white;
  font-size: 1.3rem;
}

input:focus {
  background: none;
  border: 2px solid var(--color-accent);
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

  input {
    width: 18rem;
  }
}

@media (min-width: 1600px) {
  input {
    width: 24rem;
  }
}
</style>
