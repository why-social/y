<template>
  <div>
    <h1>Nothing to <br />see here</h1>

    <Button @click="$router.push({ path: '/' })"> Go back </Button>
  </div>
</template>

<script>
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin: 2rem;
  align-items: center;
  gap: 1rem;
}

h1 {
  font-size: 3rem;
  font-weight: 600;
}

button {
  min-width: 15rem;
  width: fit-content;
}

br {
  display: none;
}

@media (max-width: 768px) {
  br {
    display: unset;
  }
}
</style>
