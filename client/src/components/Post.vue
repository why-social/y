<template>
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
        <img class="picture" v-bind:src="picture" />
      </div>
      <div class="interactions">
        <div class="clickble" ref="like">
          <span class="icon like" ref="like_icon" :class="{ liked: liked }">favorite</span>
          <span>{{ likes.length }}</span>
        </div>
        <div class="clickable">
          <span class="icon">forum</span>
          <span>{{ comments.length }}</span>
        </div>
        <div class="repost inter-tight-medium">
          <span class="icon" style="font-variation-settings: 'wght' 400">cached</span>
          <span style="padding-right: 0.4rem">Repost</span>
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
.info > span:nth-child(1) {
  opacity: 1;
  flex-shrink: 1; /* Allow it to shrink when necessary */
  overflow: hidden;
  text-overflow: ellipsis; /* Truncate with ellipsis */
  max-width: 50%; /* Limit the name to a maximum width */
}
.info > span:nth-child(2) {
  flex-shrink: 0;
}

.info > span:nth-child(3) {
  flex-shrink: 0;
}

.info > span:nth-child(4) {
  flex-shrink: 0;
}
.picture {
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  object-fit: contain;
}
.interactions {
  display: flex;
  padding-top: 0.5rem;
  flex-direction: row;
}
.interactions > * {
  flex: 1;
}
.clickable {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.2rem;
}
.clickable > * {
  opacity: 0.7;
  transition: 0.5s;
}
.icon {
  cursor: pointer;
  font-size: 2rem;
}
.like:hover {
  opacity: 1;
  color: var(--color-like);
}
.liked {
  opacity: 1;
  color: var(--color-like);
  font-variation-settings: 'FILL' 1;
}
.liked:hover {
  opacity: 0.7;
  color: var(--color-on-background);
}
.repost {
  transition: 0.5s;
  cursor: pointer;
  background: var(--color-accent);
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  font-size: 1.5rem;
  align-items: center;
  justify-content: center;
  color: var(--color-on-accent);
  border-radius: 100rem;
}
.repost:hover {
  background: var(--color-accent-highlight);
}
</style>

<script>
import { Api } from '@/Api'
import moment from 'moment'

export default {
  props: ['post'],
  data() {
    return {
      user: {},
      name: '',
      username: '',
      pfp: 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg',
      date: moment(this.post.timestamp).fromNow(),
      content: this.post.content,
      images: this.post.images,
      likes: this.post.likes,
      comments: this.post.comments,
      liked: true
    }
  },
  async created() {
    Api.get('v1/users/' + this.post.author)
      .then((response) => {
        this.user = response.data
        this.name = this.user.name
        this.username = this.user.username
        if (this.user.profile_picture) {
          Api.get('v1/images/' + this.user.profile_picture)
            .then((response) => {
              this.pfp = response.data.url
            })
            .catch((error) => {
              console.log(error)
            })
        }
      })
      .catch((error) => {
        console.log(error)
      })

    for (const image of this.images) {
      Api.get('v1/images/' + image)
        .then((response) => {
          this.pfp = response.data.url
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  mounted() {
    this.$refs.like.addEventListener('click', () => {
      this.$refs.like_icon.classList.toggle('liked')
      // TODO: update db
    })
  }
}
</script>
