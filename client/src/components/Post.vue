<template>
  <div class="post-container" @click="goToThread">
    <img class="post-pfp" v-bind:src="pfp" @click.stop="goToUser" />
    <div class="post-data">
      <div class="post-name" @click.stop="goToUser">
        <span class="inter-tight-medium">{{ name }}</span>
        <span>@{{ username }}</span>
      </div>
      <div class="post-content">
        <span class="content" :class="{ hidden: !this.content?.length }">{{
          content
        }}</span>
        <div class="picture-container" :class="{ hidden: !this.images?.length }">
          <img
            class="picture"
            v-for="image in images"
            v-bind:src="image"
            :key="image._id"
            @click.stop="showModal(images.indexOf(image))"
          />
        </div>
      </div>

      <span class="post-date">{{ date }}</span>

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
        <div class="clickable comment" @click.stop="">
          <span class="icon">forum</span>
          <span>{{ comments?.length || 0 }}</span>
        </div>
        <Button
          class="inter-tight-medium"
          @click.stop=""
          style="margin-left: auto"
        >
          <span class="icon" style="font-variation-settings: 'wght' 400"
            >cached</span
          >
          <span style="padding-right: 0.3rem">Repost</span>
        </Button>
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

<script>
import moment from 'moment'

export default {
  props: ['post'],
  data() {
    if (this.post) {
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
    } else {
      // placeholder post
      return {
        user: {},
        name: 'Shawn Dawgson',
        username: 'colguylikesdawgs',
        pfp: 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg',
        date: moment(new Date()).fromNow(),
        content: 'Can I pet that dawg',
        images: [
          'https://st3.depositphotos.com/29384342/34115/i/450/depositphotos_341157888-stock-photo-recommendation-sports-student.jpg',
          'https://randomwordgenerator.com/img/picture-generator/52e4d1424f5aa914f1dc8460962e33791c3ad6e04e5074417d2e72d2954ac5_640.jpg',
          'https://www.kdnuggets.com/wp-content/uploads/tree-todd-quackenbush-unsplash.jpg'
        ],
        likes: [],
        comments: [],
        liked: true
      }
    }
  },
  methods: {
    goToUser() {
      if (this.post) {
        this.$router.push(`/profile/${this.post.author._id}`)
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
