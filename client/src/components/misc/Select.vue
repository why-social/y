<template>
  <select
    ref="selector"
    :required="required"
    :value="modelValue"
    @input="onInput"
  >
    <option value="">{{ default }}</option>
    <option v-for="(option, index) in options" :key="index">
      {{ option }}
    </option>
  </select>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: false
    },
    default: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      required: false
    },
    modelValue: {
      type: String,
      required: true
    }
  },
  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value)
    }
  }
}
</script>

<style scoped>
select {
  font-size: 1.3rem;
  width: 100%;
  border: 2px solid var(--color-outline);
  border-radius: 100vmax;
  background: transparent;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  padding-left: 1.3rem;
  padding-right: 1.3rem;
  color: var(--color-on-background);
  transition: 0.5s;
  appearance: none;
}
select:focus {
  outline: none !important;
  border: 2px solid var(--color-accent);
}
</style>
