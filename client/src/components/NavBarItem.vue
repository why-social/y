<template>
  <b-nav-item :to="to" class="nav-pill">
    <slot />
    <span style="color:black">{{ text }}</span>
  </b-nav-item>
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
      required: true
    }
  },
  methods: {
    onHover(e) {
      console.log('A')
    }
  }
}
</script>

<style scoped>
.nav-pill {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 50rem;
  background: white;
}
</style>
