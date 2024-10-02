<template>
  <div>
    <div class="post-container">
      <img class="pfp" v-bind:src="pfp" />
      <div class="post-data">
        <div class="info">
          <span class="inter-tight-medium">{{ name }}</span>
          <span>@{{ username }}</span>
          <span class="inter-tight-medium">·</span>
          <span>{{ date }}</span>
        </div>
        <div class="post-content">
          <span class="content">{{ content }}</span>
          <div class="picture-container">
            <img
              class="picture"
              v-for="image in images"
              v-bind:src="image"
              :key="image._id"
              @click="showModal(images.indexOf(image))"
            />
          </div>
        </div>
        <div class="interactions">
          <div
            class="clickable"
            ref="like"
            :class="{ liked: liked, like: !liked }"
          >
            <span class="icon" ref="like_icon">favorite</span>
            <span>{{ likes.length }}</span>
          </div>
          <div class="clickable comment">
            <span class="icon">forum</span>
            <span>{{ comments.length }}</span>
          </div>
          <Button class="inter-tight-medium" style="margin-left: auto">
            <span class="icon" style="font-variation-settings: 'wght' 400"
              >cached</span
            >
            <span style="padding-right: 0.4rem">Repost</span>
          </Button>
        </div>
      </div>
    </div>
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-button-container" @click="modalImageIndex > 0 ? modalImageIndex-- : null">
          <span class="material-symbols-outlined icon modal-button"
            :disabled="modalImageIndex === 0">chevron_left</span>
        </div>

        <div class="modal-center">
          <span class="material-symbols-outlined icon modal-close" @click="closeModal">close</span>
          <img :v-if="modalImageIndex !== null" :src="images[modalImageIndex]" class="full-image" @click.stop />
        </div>

        <div class="modal-button-container" @click="modalImageIndex < images.length - 1 ? modalImageIndex++ : null">
          <span class="material-symbols-outlined icon modal-button"
            :disabled="modalImageIndex === images.length - 1">chevron_right</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-container {
  user-select: none;
  display: flex;
  width: 100%;
  font-size: 1.4rem;
  padding: 2rem 2.5rem;
  gap: 1rem;
}
.pfp {
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
}

.post-data {
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.post-content {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.info {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
}
.info > span {
  opacity: 0.7;
  display: inline-block;
}
.info > span {
  flex-shrink: 0;
}
.info > span:nth-child(1) {
  opacity: 1;
  flex-shrink: 1; /* Allow it to shrink when necessary */
  overflow: hidden;
  text-overflow: ellipsis; /* Truncate with ellipsis */
  max-width: 50%; /* Limit the name to a maximum width */
}

.picture-container {
  display: flex;
  height: fit-content;
  gap: 1vmin;
  flex-direction: row;
  flex-wrap: wrap;
}
.picture {
  box-sizing: border-box;
  min-width: calc(50% - 1vmin);
  flex: 1;
  border-radius: 1rem;
  object-fit: cover;
}
.picture:hover {
  cursor: pointer;
}
.picture:nth-child(2n) {
  flex-basis: calc(50% - 1vmin);
  aspect-ratio: 1/1;
}

.interactions {
  display: flex;
  padding-top: 0.5rem;
  flex-direction: row;
}
.clickable {
  margin-right: 3rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  transition: 0.3s;
  opacity: 0.7;
}
.icon {
  font-size: 2rem;
}

.like:hover {
  opacity: 1;
  color: var(--color-like);
}
.like:hover .icon {
  font-variation-settings: 'FILL' 1, 'wght' 100;
}
.liked {
  opacity: 1;
  color: var(--color-like);
}
.liked .icon {
  font-variation-settings: 'FILL' 1, 'wght' 100;
}
.liked:hover {
  color: var(--color-on-background);
}

.comment:hover {
  opacity: 1;
  color: var(--color-accent);
}
.comment:hover .icon {
  font-variation-settings: 'FILL' 1, 'wght' 100, 'GRAD' 0, 'opsz' 20;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 69;
}

.modal-content {
  width: fit-content;
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}

.full-image {
  max-width: 60vw;
  max-height: 85vh;
  min-width: 50vh;
  min-height: 50vh;
  object-fit: contain;
  border-radius: 10px;
}

.modal-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.modal-close {
  align-self: flex-end;
  margin-bottom: 1rem;
  cursor: pointer;
  font-size: 2.5rem;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem;
  border-radius: 50%;
  color: black;
}

.modal-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
  background: red;
  cursor: pointer;
}

.modal-button {
  border: none;
  padding: 1rem;
  color: var(--color-on-background);
  user-select: none;
}

.modal-button:disabled {
  color: red;
}

</style>

<script>
import moment from 'moment'

export default {
  props: ['post'],
  data() {
    return {
      user: this.post.author,
      name: this.post.author.name,
      username: this.post.author.username,
      pfp:
        this.post.author.profile_picture ||
        'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg',
      date: moment(this.post.timestamp).fromNow(),
      content: this.post.content,
      images: this.post.images || [],
      likes: this.post.likes,
      comments: this.post.comments,
      liked: true,
      modalImageIndex: null,
      isModalOpen: false
    }
  },
  methods: {
    showModal(index) {
      this.isModalOpen = true
      this.modalImageIndex = index
      console.log(this.modalImageIndex)
    },
    closeModal() {
      this.isModalOpen = false
      this.modalImageIndex = null
    }
  },
  mounted() {
    this.$refs.like.addEventListener('click', () => {
      this.$refs.like.classList.toggle('liked')
      this.$refs.like.classList.toggle('like')
      // TODO: update db
    })
  }
}
</script>
