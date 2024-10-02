<template>
  <button class="inter-tight-medium">
    <slot />
  </button>
</template>

<style scoped>
button {
  transition: 0.2s;
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  border: none;
  user-select: none;
  font-size: 1.5rem;
  padding: 1rem;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--color-on-accent);
  border-radius: 100rem;
  border: 2px solid var(--color-accent);
}

button:hover {
  background: var(--color-button-highlight);
  border: 2px solid var(--color-button-highlight);
}

button:active {
  background: var(--color-button-emphasize);
  border: 2px solid var(--color-button-emphasize);
}

button[secondary] {
  border: 2px solid var(--color-outline);
  background: var(--color-background);
  color: var(--color-on-background);
}

button[secondary]:hover {
  background: var(--color-button-secondary-highlight);
}

button[secondary]:active {
  background: var(--color-button-secondary-emphasize);
}

button:focus {
  outline: none !important;
  border: 2px solid var(--color-accent);
}
</style>
