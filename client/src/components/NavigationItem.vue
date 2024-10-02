<template>
  <div @click="$router.push({ path: this.to })" class="nav-pill">
    <span class="material-symbols-outlined icon">{{ icon }}</span>
    <span class="label">{{ text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.nav-pill {
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: center;
  width: fit-content;
  gap: 1rem;
  align-items: center;
  border-radius: 100vmax;
  transition: 0.3s;
  padding: 0.7rem;
  font-size: 1.5rem;
}

.label {
  display: none;
  line-height: 90%;
  padding-right: 0.7rem;
}

.icon {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
  font-size: 3rem;
}

.nav-pill:hover {
  background: var(--color-background-highlight);
}

@media (min-width: 1200px) {
  .label {
    display: unset;
  }
}
</style>
