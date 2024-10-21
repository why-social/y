<template>
  <b-dropdown end class="themed-drop-down icon" text="more_vert" data-bs-display="static">
    <b-dropdown-item
      v-for="option in options"
      :key="option"
      @click="this.$emit(option.toLowerCase())"
    >
      {{ option }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<style>
.themed-drop-down {
  margin-left: auto;
}

.themed-drop-down > button {
  height: 3.15rem;
  width: 3.15rem;
  font-size: 1.5rem;
  line-height: 100%;
  background: transparent;
  text-align: center;
  border-radius: 100%;
  border-color: transparent;
  outline: none;
}

.themed-drop-down > ul {
  padding: 0.5rem;
  border-color: var(--color-background-highlight);
  background: var(--color-background);
  border-radius: 1rem;
  box-shadow: 0 0 0.2rem var(--color-background-highlight),
    0 0 1rem var(--color-background-highlight);
}

.themed-drop-down ul button {
  font-family: 'Inter Tight', sans-serif;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  padding: 0.5rem;
  color: var(--color-on-background);
}

.themed-drop-down button:visited,
.themed-drop-down button:active,
.themed-drop-down button:focus,
.themed-drop-down button:hover {
  border-color: transparent;
  outline: none;
  color: var(--color-on-background);
  background: var(--color-background-highlight);
}

.themed-drop-down ::after {
  display: none !important;
}
</style>

<script>
export default {
  props: ['options']
}
</script>
