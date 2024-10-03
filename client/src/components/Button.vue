<template>
  <button class="inter-tight-medium">
    <slot />
  </button>
</template>

<style scoped>
button {
  transition: 0.3s background, 0.3s border, 0.3s opacity;
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  border: none;
  user-select: none;
  font-size: 1.5rem;
  padding: 0.7rem;
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

button[disabled] {
  pointer-events: none;
  opacity: 0.5;
}

button:focus {
  outline: none !important;
  border: 2px solid var(--color-accent);
}
</style>
