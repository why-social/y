<template>
  <div class="input-container">
    <span class="material-symbols-outlined input-icon">{{ icon }}</span>
    <input
      class="inter-tight-regular"
      :type="type"
      :title="title"
      :value="modelValue"
      :placeholder="placeholder"
      :pattern="pattern"
      :required="required"
      :class="[icon ? 'input-icon-padding' : '', customClass]"
      @input="onInput"
    />
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: false
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
    },
    customClass: {
      type: String,
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
.input-container {
  width: 100%;
  height: fit-content;
  position: relative;
  overflow: hidden;
}

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

input[type='text'] {
  font-size: 1.3rem;
}

input[type='email'] {
  font-size: 1.3rem;
}

input[type='password'] {
  font-size: 1.3rem;
}

.input-icon-padding {
  padding-left: 3.5rem;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  font-size: 1.8rem;
  user-select: none;
  opacity: 0.7;
  transition: 0.5s;
}

input:focus {
  outline: none !important;
  border: 2px solid var(--color-accent);
}

.input-icon:has(+input:focus) {
  opacity: 1;
  color: var(--color-accent);
}

.profile-edit-input {
  padding: 0.3rem 1rem;
}
</style>
