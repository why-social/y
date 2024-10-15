<!-- #region Template -->
<template>
  <div class="post-container" @click="goToThread">
    <img v-if="isRepost" class="post-pfp" :src="originalAuthor.profile_picture" @click.stop="goToUser(originalAuthor._id)" />
    <img v-else class="post-pfp" :src="pfp" @click.stop="goToUser(user._id)" />
    <div class="post-data">
      <div v-if="isRepost" class="reposter-data" @click.stop="goToUser(user._id)">
        <span class="icon">cached</span>
        <img v-bind:src="pfp" />
        <span class="handle-link">@{{ post.author.username }}</span>
        <span>reposted</span>
      </div>
      <div class="post-name" @click.stop="(originalAuthor) ? goToUser(originalAuthor._id) : goToUser(user._id)">
        <span class="inter-tight-medium">{{ name }}</span>
        <span>@{{ username }}</span>
      </div>
      <div class="post-content">
        <span class="content" :class="{ hidden: !this.content?.length }">{{content}}</span>
        <div class="picture-container" :class="{ hidden: !this.images?.length }">
          <img class="picture" v-for="image in images" v-bind:src="image" :key="image._id" @click.stop="showModal(images.indexOf(image))"/>
        </div>
      </div>

      <span class="post-date">{{ date }}</span>

      <div class="interactions">
        <div @click.stop="toggleLike" class="clickable" ref="like" :class="{ liked: liked, like: !liked }">
          <span class="icon" ref="like_icon">favorite</span>
          <span>{{ likes?.length || 0 }}</span>
        </div>
        <div class="clickable comment" @click.stop="">
          <span class="icon">forum</span>
          <span>{{ comments?.length || 0 }}</span>
        </div>
        <Button v-if="viewer.userId !== user._id" class="inter-tight-medium" @click.stop="repost" style="margin-left: auto">
          <span class="icon" style="font-variation-settings: 'wght' 400">cached</span>
          <span style="padding-right: 0.3rem">Repost</span>
        </Button>
      </div>
    </div>
    <ImageCarousel v-if="isModalOpen" :images="images" :startIndex="modalImageIndex" @close="closeModal" />
  </div>
</template>
<!-- #endregion -->

<!-- #region Style -->
<style scoped>
.post-container {
  cursor: pointer;
  user-select: none;
  display: flex;
  width: 100%;
  font-size: 1.4rem;
  padding: 1rem;
  gap: 0.5rem;
}
.post-pfp {
  cursor: pointer;
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
}

button {
  padding: 0.7rem;
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
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.post-name {
  display: flex;
  width: fit-content;
  cursor: pointer;
  flex-direction: column;
  line-height: 130%;
}

.post-name > span {
  opacity: 1;
}

.post-name:hover > span:nth-child(1) {
  text-decoration: underline;
}

.post-name > span:nth-child(2) {
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

.post-date {
  font-size: 1.2rem;
  opacity: 0.5;
}

.reposter-data {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.25rem;
}

.reposter-data img {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 100%;
  cursor: pointer;
}

.reposter-data span {
  opacity: 0.75;
  font-size: 1.1rem;
}
.reposter-data .icon {
  font-size: 1.5rem;
}

.handle-link {
  text-decoration: none;
}
.handle-link:hover {
  text-decoration: underline;
  cursor: pointer;
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
  .post-pfp {
    width: 3.5rem;
    height: 3.5rem;
  }

  .post-container {
    font-size: 1.2rem;
  }

  .post-info > span:nth-child(2) {
    font-size: 1rem;
  }

  .post-date {
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
<!-- #endregion -->

<!-- #region Script -->
<script>
import moment from 'moment'
import VueJwtDecode from 'vue-jwt-decode'
import { Api } from '@/Api'

export default {
  props: ['post'],
  data() {
    return {
      user: this.post.author,
      name: this.post.original_post_id?.author.name || this.post.author.name,
      username: this.post.original_post_id?.author.username || this.post.author.username,
      pfp:
        this.post.author.profile_picture ||
        'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg',
      date: moment(this.post.timestamp).fromNow(),
      content: this.post.content,
      images: this.post.images || [],
      likes: this.post.likes,
      comments: this.post.comments,
      modalImageIndex: null,
      isModalOpen: false,
      isRepost: !!this.post.original_post_id,
      originalAuthor: this.post.original_post_id?.author || null
    }
  },
  computed: {
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token'))
    },
    liked() {
      return this.likes.includes(this.viewer.userId)
    }
  },
  methods: {
    goToUser(userId) {
      if (this.post) {
        this.$router.push(`/profile/${userId}`)
      }
    },
    goToThread() {
      if (this.post) {
        this.$router.push(`/thread/${this.post._id}`)
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
    toggleLike() {
      if (this.liked) {
        this.likes.splice(this.likes.indexOf(this.viewer.userId), 1)
        Api.delete(`/v1/posts/${this.post._id}/likes/${this.viewer.userId}`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
      } else {
        this.likes.push(this.viewer.userId)
        Api.post(`/v1/posts/${this.post._id}/likes`, null, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
      }
    },
    repost() {
      Api.post('/v1/posts/repost', { postId: this.post._id }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
    }
  },
  mounted() {
    console.log(this.post)
  }
}
</script>
<!-- #endregion -->
