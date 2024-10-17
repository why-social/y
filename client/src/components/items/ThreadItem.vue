<template>
  <div thread-item ref="threadItem" @click="goToThread">
    <img
      v-if="isRepost"
      class="avatar"
      :src="originalAuthor?.profile_picture_url"
      @click.stop="goToUser(originalAuthor.username)"
    />
    <img
      v-else
      class="avatar"
      :src="avatar"
      @click.stop="goToUser(author.username)"
    />

    <div class="data">
      <div class="d-flex">
        <div class="d-block">
          <div
            v-if="isRepost"
            class="reposter-data"
            @click.stop="goToUser(author.username)"
          >
            <span class="icon">cached</span>
            <img :src="avatar" />
            <span class="handle-link">@{{ author.username }}</span>
            <span>reposted</span>
          </div>

          <template v-if="isRepost">
            <div class="name" @click.stop="goToUser(originalAuthor.username)">
              <span class="inter-tight-medium">{{ originalAuthor?.name }}</span>
              <span>@{{ originalAuthor?.username }}</span>
            </div>
          </template>
          <template v-else>
            <div class="name" @click.stop="goToUser(author.username)">
              <span class="inter-tight-medium">{{ author.name }}</span>
              <span>@{{ author.username }}</span>
            </div>
          </template>
        </div>

        <div
          v-if="this.viewer?.userId === this.author?._id"
          @click.stop
          style="margin-left: auto"
        >
          <DropDown
            @edit="enableEditing"
            @delete="this.$emit('delete')"
            :options="['Edit', 'Delete']"
          />
        </div>
      </div>

      <div class="content">
        <contenteditable
          ref="contentText"
          id="thread-prompt-input"
          v-model="content"
          ondrop="return false"
          contenteditable="false"
          placeholder="Text content"
          @keyup="computeValidity"
          :class="{ hidden: !this.content?.length && editing }"
        >
          {{ content }}
        </contenteditable>

        <div
          class="pictures-container"
          :class="{ hidden: !this.images?.length }"
        >
          <div
            class="picture-container"
            v-for="image in images"
            :key="image._id"
          >
            <span class="remove icon" @click.stop="removeImage(image)"
              >delete</span
            >
            <img
              class="picture"
              v-bind:src="image"
              @click.stop="showModal(images.indexOf(image))"
            />
          </div>
        </div>
      </div>

      <div class="edit-interactions">
        <label class="attach-label" for="images">
          <span class="material-symbols-outlined attach-icon">attach_file</span>
          <span class="file-counter" :class="{ error: images.length >= 4 }">
            {{ images.length }}/4
          </span>
        </label>

        <input
          class="file-input"
          id="images"
          type="file"
          accept="image/*"
          multiple
          :disabled="images.length >= 4"
          @change="uploadImages"
        />

        <Button secondary style="margin-left: auto" @click.stop="cancelEditing">
          Cancel
        </Button>
        <Button @click.stop="submitEdit" :disabled="!isValid"> Submit </Button>
      </div>

      <span class="date">{{ date }}</span>

      <div class="interactions">
        <div
          @click.stop="like()"
          class="clickable"
          ref="like"
          :class="{
            liked: liked,
            like: !liked
          }"
        >
          <span class="icon">favorite</span>
          <span>{{ likes?.length || 0 }}</span>
        </div>

        <div class="clickable comment" @click="goToThread">
          <span class="icon">forum</span>
          <span>{{ comments?.length || 0 }}</span>
        </div>

        <slot></slot>
      </div>
    </div>

    <ImageCarousel
      v-if="isModalOpen"
      :images="images"
      :startIndex="modalImageIndex"
      @close="closeModal"
    />
  </div>
</template>

<script>
import moment from 'moment'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  props: ['item', 'dateFormat'],

  data() {
    const obj = {
      author: this.item.author,
      avatar: this.item.author?.profile_picture_url,
      date: moment(this.item.timestamp),
      content: this.item.content,
      images: this.item.image_urls || [],
      likes: this.item.likes,
      comments: this.item.comments,
      modalImageIndex: null,
      isModalOpen: false,
      isRepost: !!this.item.original_post,

      uploadedImages: [],
      deletedImages: []
    }

    if (this.dateFormat === 'now') {
      obj.date = obj.date.fromNow()
    } else {
      obj.date = obj.date.format('MMMM Do YYYY, hh:mm')
    }

    if (obj.isRepost) {
      obj.originalAuthor = this.item.original_post.author
    }

    return obj
  },

  methods: {
    like() {
      if (this.liked) {
        this.$emit('unlike')
        this.likes.splice(this.likes.indexOf(this.viewer.userId), 1)
      } else {
        this.$emit('like')
        this.likes.push(this.viewer.userId)
      }
    },
    goToUser(username) {
      this.$router.push(`/profile/${username}`)
    },
    goToThread() {
      if (!this.editing) {
        this.$router.push(`/thread/${this.item._id}`)
      }
    },
    enableEditing() {
      this.$refs.threadItem.setAttribute('editable', '')
      this.$refs.contentText.setAttribute('contenteditable', 'true')
    },
    cancelEditing() {
      this.$refs.threadItem.removeAttribute('editable')
      this.$refs.contentText.setAttribute('contenteditable', 'false')

      Object.assign(this.$data, this.$options.data.call(this))

      this.$refs.contentText.innerText = this.content
    },
    submitEdit() {
      const formData = new FormData()
      formData.append('content', this.$refs.contentText.innerText)

      for (const deleted of this.deletedImages) {
        const captured = /^.*uploads\/(.*)\/.*$/.exec(deleted)

        if (captured?.length > 0) {
          formData.append('deletedImages', captured[1])
        }
      }

      for (const image of this.uploadedImages) {
        formData.append('images', image)
      }

      this.$emit('edit', formData)

      this.uploadedImages = []
      this.deletedImages = []

      this.$refs.threadItem.removeAttribute('editable')
      this.$refs.contentText.setAttribute('contenteditable', 'false')
    },
    removeImage(image) {
      this.uploadedImages = this.uploadedImages.filter((item) => {
        if (URL.createObjectURL(item) === image) {
          this.images = this.images.filter((imageURL) => imageURL !== item)

          return false
        }

        return true
      })

      this.images = this.images.filter((item) => {
        if (item === image) {
          this.deletedImages.push(image)

          return false
        }

        return true
      })

      this.computeValidity()
    },
    uploadImages() {
      let images = Object.values(event.target.files)

      if (images?.length) {
        images = images.slice(0, 4 - this.images?.length)

        images.forEach((image) => {
          if (image.size / 1024 / 1024 < 12) {
            this.uploadedImages.push(image)
            this.images.push(URL.createObjectURL(image))
          } else {
            window.alert('Images must not exceed 12 megabytes.')
          }
        })
      }

      this.computeValidity()
    },
    showModal(index) {
      this.isModalOpen = true
      this.modalImageIndex = index
    },
    closeModal() {
      this.isModalOpen = false
      this.modalImageIndex = null
    },
    computeValidity() {
      this.isValid =
        this.images?.length || this.$refs.contentText?.innerText?.length
    }
  },

  computed: {
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token'))
    },
    editing() {
      return this.$refs.threadItem?.hasAttribute('editable')
    },
    liked() {
      return this.likes.includes(this.viewer.userId)
    }
  }
}
</script>

<style>
div[thread-item] {
  position: relative;
  user-select: none;
  display: flex;
  overflow-x: visible;
  width: 100%;
  font-size: 1.4rem;
  padding: 1rem;
  gap: 0.5rem;
}

div[thread-item] .avatar {
  cursor: pointer;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 100%;
}

div[thread-item] button {
  padding: 0.5rem;
  font-size: 1.2rem;
}

div[thread-item] .data {
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

div[thread-item] .data {
  overflow: visible;
}

div[thread-item] .content {
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  overflow-x: visible;
  gap: 1rem;
  flex-direction: column;
}

div[thread-item] .content > contenteditable {
  border-radius: 0.5rem;
  margin: -0.5rem;
  padding: 0.5rem;
}

div[thread-item] .name {
  display: flex;
  width: fit-content;
  cursor: pointer;
  flex-direction: column;
  line-height: 130%;
}

div[thread-item] .name > span {
  opacity: 1;
}

div[thread-item] .name:hover > span:nth-child(1) {
  text-decoration: underline;
}

div[thread-item] .name > span:nth-child(2) {
  opacity: 0.5;
  font-size: 1.2rem;
}

div[thread-item] .pictures-container {
  width: 100%;
  display: flex;
  overflow: hidden;
  height: fit-content;
  gap: 1vmin;
  flex-direction: row;
  flex-wrap: wrap;
}

div[thread-item] .picture-container {
  position: relative;
  box-sizing: border-box;
  min-width: calc(50% - 1vmin);
  overflow: hidden;
  flex: 1;
  border-radius: 1vmax;
  object-fit: cover;
  aspect-ratio: 1/1;
}

div[thread-item] .picture-container:hover {
  cursor: pointer;
}

div[thread-item] .picture-container:nth-child(2n) {
  flex-basis: calc(50% - 1vmin);
}

div[thread-item]
  .picture-container:last-child:not(.picture-container:nth-child(2n)) {
  aspect-ratio: unset;
}

div[thread-item] .picture {
  width: 100%;
  height: 100%;
  max-height: 70vh;
  object-fit: cover;
}

div[thread-item] .date {
  font-size: 1.2rem;
  opacity: 0.5;
}

div[thread-item] .interactions {
  display: flex;
  padding-top: 0.5rem;
  flex-direction: row;
}

div[thread-item] .clickable {
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

div[thread-item] .icon {
  font-size: 1.5rem;
  line-height: 80%;
}

div[thread-item] .hidden {
  display: none;
}

div[thread-item] .like:hover {
  opacity: 1;
  color: var(--color-like);
}

div[thread-item] .like:hover .icon {
  font-variation-settings: 'FILL' 1, 'wght' 100;
}

div[thread-item] .liked {
  opacity: 1;
  color: var(--color-like);
}

div[thread-item] .liked .icon {
  font-variation-settings: 'FILL' 1, 'wght' 100;
}

div[thread-item] .liked:hover {
  color: var(--color-on-background);
}

div[thread-item] .comment:hover {
  opacity: 1;
  color: var(--color-accent);
}

div[thread-item] .comment:hover .icon {
  font-variation-settings: 'FILL' 1, 'wght' 100, 'GRAD' 0, 'opsz' 20;
}

div[thread-item] .btn-group {
  position: absolute;
  right: 0;
  top: 0;
}

div[thread-item] .reposter-data {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.25rem;
}

div[thread-item] .reposter-data img {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 100%;
  cursor: pointer;
}

div[thread-item] .reposter-data span {
  opacity: 0.75;
  font-size: 1.1rem;
}

div[thread-item] .reposter-data .icon {
  font-size: 1.5rem;
}

div[thread-item] .reposter-data:hover .handle-link {
  text-decoration: underline;
}

@media (max-width: 630px) {
  div[thread-item] .container {
    font-size: 1.2rem;
  }

  div[thread-item] .info > span:nth-child(2) {
    font-size: 1rem;
  }

  div[thread-item] .date {
    font-size: 1rem;
  }

  div[thread-item] .clickable {
    margin-right: 1rem;
  }

  div[thread-item] button {
    padding: 0.5rem;
    font-size: 1.2rem;
  }
}

div[thread-item] input[type='file'] {
  display: none;
}

div[thread-item] .edit-interactions {
  display: flex;
  gap: 1rem;
  display: none;
}

div[thread-item] .file-counter {
  padding: 0.5rem;
  opacity: 0.7;
}

div[thread-item] .attach-label {
  display: flex;
  user-select: none;
  font-size: 1.3rem;
  align-items: center;
  cursor: pointer;
}

div[thread-item] .attach-icon {
  user-select: none;
  color: var(--color-accent);
  vertical-align: center;
  font-size: 2rem;
}

div[thread-item] .remove {
  width: 3rem;
  cursor: pointer;
  height: 3rem;
  right: 1rem;
  top: 1rem;
  text-align: center;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(4px);
  border-radius: 100%;
  background: rgba(0, 0, 0, 0.6);
  transition: 0.3s;
  position: absolute;
  display: none;
}

div[thread-item] .remove:hover {
  background: var(--color-background-highlight);
}

div[thread-item][editable] [contenteditable='true'] {
  outline: 2px solid var(--color-outline);
}

div[thread-item][editable] [contenteditable='true']:empty:before {
  display: unset !important;
  content: attr(placeholder);
  cursor: text;
  opacity: 0.7;
  color: var(--color-on-background);
}

div[thread-item][editable] .remove {
  display: flex;
}

div[thread-item][editable] .interactions {
  display: none;
}

div[thread-item][editable] .edit-interactions {
  display: inherit;
}
</style>
