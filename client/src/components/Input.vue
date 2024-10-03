<template>
  <input
    class="inter-tight-regular"
    :type="type"
    :title="title"
    :value="modelValue"
    :placeholder="placeholder"
    :pattern="pattern"
    :required="required"
    @input="onInput"
  />
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      required: true
    },
    pattern: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    }
  },
  methods: {
    onInput(event) {
      // Emit update:modelValue for v-model
      this.$emit('update:modelValue', event.target.value)
    }
  }
}
</script>

<style scoped>
input {
  width: 100%;
  border: 2px solid var(--color-outline);
  border-radius: 100vmax;
  background: transparent;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  padding-left: 1.3rem;
  padding-right: 1.3rem;
  color: var(--color-on-background);
  transition: border 0.5s, background 0.5s;
}

input:focus {
  outline: none !important;
  border: 2px solid var(--color-accent);
}

input[type='text'] {
  font-size: 1.3rem;
}

input[type='email'] {
  font-size: 1.3rem;
}

input[type='password'] {
  font-size: 1.3rem;
}
</style>
