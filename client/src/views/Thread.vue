<template>
  <div id="content">
    <div class="post-container">
      <img class="pfp" v-bind:src="pfp" />
      <div class="post-data">
        <div class="info">
          <span class="inter-tight-medium">{{ name }}</span>
          <span>@{{ username }}</span>
        </div>
        <div class="post-content">
          <span class="content">{{ content }}</span>
          <div class="picture-container">
            <img
              class="picture"
              v-for="image in images"
              v-bind:src="image"
              :key="image._id"
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
          <Button class="inter-tight-medium" style="margin-left: auto">
            <span class="icon" style="font-variation-settings: 'wght' 400"
              >cached</span
            >
            <span style="padding-right: 0.4rem">Repost</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#content {
  overflow: hidden;
  display: block;
  height: 100%;
  width: 100%;
}

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
  flex-direction: column;
}
.info > span {
  opacity: 0.7;
  line-height: 120%;
  display: inline-block;
}
.info > span:last-child {
  font-size: 1.2rem;
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

.timestamp {
  opacity: 0.7;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
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
</style>

<script>
import { Api } from '@/Api'
import moment from 'moment'

export default {
  data() {
    return {
      type: 'post',
      user: '',
      name: '',
      username: '',
      pfp: '',
      time: '',
      date: '',
      content: '',
      images: [],
      likes: [],
      comments: [],
      liked: true
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

      this.name = data.author.name
      this.username = data.author.username
      this.time = momentDate.format('hh:mm')
      this.date = momentDate.format('MMMM Do YYYY')
      this.content = data.content
      this.likes = data.likes
      this.images = data.images
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
