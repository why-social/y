<script setup>
import Button from '@/components/misc/Button.vue'
</script>

<template>
  <div>
    <h1>Server is <br />unreachable</h1>

    <Button @click="$router.push({ path: '/' })"> Try again </Button>
  </div>
</template>

<style scoped>
div {
  pointer-events: all;
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
