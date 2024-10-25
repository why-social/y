<template>
  <Teleport to="body">
    <div
      class="modal-overlay"
      @click.stop="closeModal"
      v-on:keydown.esc="closeModal"
    >
      <span
        class="material-symbols-outlined modal-icon modal-button-container"
        @click.stop="closeModal"
        >arrow_left_alt</span
      >

      <div class="modal-center">
        <div
          class="modal-button-container"
          :class="{ disabled: currentIndex === 0 }"
          @click.stop
        >
          <span
            class="material-symbols-outlined modal-icon"
            @click.stop="prevImage"
            >chevron_left</span
          >
        </div>

        <img :src="images[currentIndex]" class="full-image" @click.stop />

        <div
          class="modal-button-container"
          :class="{ disabled: currentIndex === images.length - 1 }"
          @click.stop
        >
          <span
            class="material-symbols-outlined modal-icon"
            @click.stop="nextImage"
            >chevron_right</span
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  props: ['images', 'startIndex'],
  data() {
    return {
      currentIndex: this.startIndex || 0
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    nextImage() {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++
      }
    },
    prevImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.closeModal()
      } else if (event.key === 'ArrowLeft') {
        this.prevImage()
      } else if (event.key === 'ArrowRight') {
        this.nextImage()
      }
    }
  },
  mounted() {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style scoped>
.modal-overlay {
  pointer-events: all;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 69;
}

.modal-icon {
  font-variation-settings: 'FILL' 1, 'wght' 200;
  padding: 1rem;
  font-size: 2rem;
}

.full-image {
  max-width: 60vw;
  max-height: 85vh;
  min-width: 50vh;
  min-height: 50vh;
  object-fit: cover;
  border-radius: 1rem;
}

.modal-row {
  flex-direction: row;
  width: 100%;
}

.modal-center {
  position: absolute;
  top: 50%;
  bottom: 50%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.modal-button-container {
  width: fit-content;
  margin-bottom: 1rem;
  cursor: pointer;
  font-size: 2.5rem;
  background-color: rgba(49, 49, 49, 0.85);
  margin: 2rem;
  border-radius: 50%;
  color: var(--color-on-background);
  border: none;
  user-select: none;
  transition: 0.25s;
}

.disabled {
  cursor: default;
  opacity: 20%;
}
</style>
