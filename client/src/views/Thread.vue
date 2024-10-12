<template>
  <div id="container">
    <div
      class="thread-parent"
      :class="{ hidden: !this.origin_type?.length }"
      @click.stop="goToParent"
    >
      <span class="icon" style="font-variation-settings: 'wght' 300"
        >step_out</span
      >
      <span style="padding-right: 0.7rem">Original {{ origin_type }}</span>
    </div>

    <div class="thread-container">
      <img class="thread-pfp" v-bind:src="pfp" @click.stop="goToUser" />

      <div class="thread-data">
        <div class="thread-name" @click.stop="goToUser">
          <span class="inter-tight-medium">{{ name }}</span>
          <span>@{{ username }}</span>
        </div>

        <div class="thread-content">
          <span class="content" :class="{ hidden: !this.content?.length }">{{
            content
          }}</span>

          <div
            class="picture-container"
            :class="{ hidden: !this.images?.length }"
          >
            <img
              class="picture"
              v-for="image in images"
              v-bind:src="image"
              :key="image._id"
              @click.stop="showModal(images.indexOf(image))"
            />
          </div>
        </div>

        <div class="timestamp">
          <span>{{ time }}</span>
          <span class="inter-tight-medium">·</span>
          <span>{{ date }}</span>
        </div>

        <div class="interactions">
          <div
            @click.stop=""
            class="clickable"
            ref="like"
            :class="{ liked: liked, like: !liked }"
          >
            <span class="icon" ref="like_icon">favorite</span>
            <span>{{ likes?.length || 0 }}</span>
          </div>

          <div class="clickable comment" style="pointer-events: none">
            <span class="icon">forum</span>
            <span>{{ comments?.length || 0 }}</span>
          </div>
        </div>
      </div>

      <ImageCarousel
        v-if="isModalOpen"
        :images="images"
        :startIndex="modalImageIndex"
        @close="closeModal"
      />
    </div>

    <hr />

    <CommentPrompt  />

    <hr />
  </div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.thread-parent {
  padding: 20px;
  margin-left: 1rem;
  display: flex;
  cursor: pointer;
  align-items: center;
  width: fit-content;
  user-select: none;
  font-size: 1.4rem;
  padding: 0.7rem;
  transition: 0.3s background;
  border-radius: 100vmax;
}
.thread-parent:hover {
  background: var(--color-background-highlight);
}

.thread-container {
  user-select: none;
  display: flex;
  width: 100%;
  font-size: 1.4rem;
  margin: 20px;
  padding: 1rem;
  gap: 0.5rem;
}
.thread-pfp {
  cursor: pointer;
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
}

button {
  padding: 0.7rem;
}

.thread-data {
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.thread-content {
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.thread-name {
  display: flex;
  width: fit-content;
  cursor: pointer;
  flex-direction: column;
  line-height: 130%;
}

.thread-name > span {
  opacity: 1;
}

.thread-name:hover > span:nth-child(1) {
  text-decoration: underline;
}

.thread-name > span:nth-child(2) {
  opacity: 0.5;
  font-size: 1.2rem;
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
  border-radius: 1vmax;
  object-fit: cover;
}
.picture:hover {
  cursor: pointer;
}
.picture:nth-child(2n) {
  flex-basis: calc(50% - 1vmin);
  aspect-ratio: 1/1;
}

.timestamp {
  display: flex;
  gap: 0.4rem;
  font-size: 1.2rem;
  opacity: 0.5;
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
  line-height: 80%;
}

.hidden {
  display: none;
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

@media (max-width: 630px) {
  .thread-pfp {
    width: 3.5rem;
    height: 3.5rem;
  }

  .thread-container {
    font-size: 1.2rem;
  }

  .thread-info > span:nth-child(2) {
    font-size: 1rem;
  }

  .timestamp {
    font-size: 1rem;
  }

  .clickable {
    margin-right: 1rem;
  }

  button {
    padding: 0.5rem;
    font-size: 1.2rem;
  }

  .icon {
    font-size: 1.5rem;
    line-height: 80%;
  }
}
</style>

<script>
import { Api } from '@/Api'
import moment from 'moment'

export default {
  data() {
    return {
      type: 'post',
      origin_type: '',
      parent: '',
      author: '',
      name: '',
      username: '',
      pfp: '',
      time: '',
      date: '',
      content: '',
      images: [],
      likes: [],
      comments: [],
      liked: true,
      modalImageIndex: null,
      isModalOpen: false
    }
  },
  methods: {
    getComment() {
      Api.get(`/v1/comments/${this.$route.params.id}`, {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      })
        .then((response) => {
          this.type = 'comment'
          this.loadData(response.data)
        })
        .catch(() => {
          // TODO: 404
        })
    },
    getThread() {
      Api.get(`/v1/posts/${this.$route.params.id}`, {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      })
        .then((response) => {
          this.type = 'post'
          this.loadData(response.data)
        })
        .catch(this.getComment())
    },
    loadData(data) {
      const momentDate = moment(data.timestamp)

      this.author = data.author._id
      this.name = data.author.name
      this.username = data.author.username
      this.time = momentDate.format('hh:mm')
      this.date = momentDate.format('MMMM Do YYYY')
      this.content = data.content
      this.likes = data.likes
      this.images = data.images
      this.pfp =
        data.author.profile_picture ||
        'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg'

      if (this.type === 'post') {
        if (data.original_post_id) {
          this.origin_type = 'post'
          this.parent = data.original_post_id
        }
      } else {
        if (data.parent_is_post) {
          this.origin_type = 'post'
        } else {
          this.origin_type = 'comment'
        }

        this.parent = data.parent_id
      }
    },
    showModal(index) {
      this.isModalOpen = true
      this.modalImageIndex = index
    },
    closeModal() {
      this.isModalOpen = false
      this.modalImageIndex = null
    },
    goToUser() {
      if (this.author) {
        this.$router.push(`/profile/${this.author}`)
      }
    },
    goToParent() {
      if (this.parent) {
        this.$router.push(`/thread/${this.parent}`)
      }
    }
  },
  async mounted() {
    this.getThread()

    this.$refs.like.addEventListener('click', () => {
      this.$refs.like.classList.toggle('liked')
      this.$refs.like.classList.toggle('like')
      // TODO: update db
    })
  }
}
</script>
