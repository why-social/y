<template>
  <div thread-item @click="goToThread">
    <img class="avatar" v-bind:src="avatar" @click.stop="goToUser" />

    <div class="data">
      <div class="name" @click.stop="goToUser">
        <span class="inter-tight-medium">{{ user.name }}</span>
        <span>@{{ user.username }}</span>
      </div>

      <div class="content">
        <span
          :class="{
            hidden: !this.content?.length
          }"
        >
          {{ content }}
        </span>

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

      <span class="date">{{ date }}</span>

      <div class="interactions">
        <div
          @click.stop="like()"
          class="clickable"
          ref="like"
          :class="{
            liked: isLiked,
            like: !isLiked
          }"
        >
          <span class="icon">favorite</span>
          <span>{{ likes?.length || 0 }}</span>
        </div>

        <div class="clickable comment">
          <span class="icon">forum</span>
          <span>{{ comments?.length || 0 }}</span>
        </div>

        <slot></slot>
      </div>
    </div>

    <!--TODO deletion-->

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

export default {
  props: ['item', 'dateFormat'],

  data() {
    let obj

    if (this.item) {
      obj = {
        user: this.item.author,
        avatar: this.item.author?.profile_picture,
        date: moment(this.item.timestamp),
        content: this.item.content,
        images: this.item.images || [],
        likes: this.item.likes,
        comments: this.item.comments,
        liked: true,
        modalImageIndex: null,
        isModalOpen: false
      }
    } else {
      // placeholder
      obj = {
        user: {
          name: 'Shawn Dawgson',
          username: 'colguylikesdawgs'
        },
        date: moment(new Date()),
        content: 'Can I pet that dawg',
        images: [
          'https://st3.depositphotos.com/29384342/34115/i/450/depositphotos_341157888-stock-photo-recommendation-sports-student.jpg',
          'https://randomwordgenerator.com/img/picture-generator/52e4d1424f5aa914f1dc8460962e33791c3ad6e04e5074417d2e72d2954ac5_640.jpg',
          'https://www.kdnuggets.com/wp-content/uploads/tree-todd-quackenbush-unsplash.jpg'
        ],
        likes: [],
        comments: [],
        liked: true,
        modalImageIndex: null,
        isModalOpen: false
      }
    }

    if (this.dateFormat === 'now') {
      obj.date = obj.date.fromNow()
    } else {
      obj.date = obj.date.format('MMMM Do YYYY, hh:mm')
    }

    return obj
  },

  methods: {
    like() {
      this.liked = !this.liked

      this.$emit('like')
    },
    goToUser() {
      this.$router.push(`/profile/${this.user._id}`)
    },
    goToThread() {
      this.$router.push(`/thread/${this.item._id}`)
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

  computed: {
    isLiked() {
      return this.liked
    }
  }
}
</script>

<style>
div[thread-item] {
  cursor: pointer;
  user-select: none;
  display: flex;
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

div[thread-item] .content {
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
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

div[thread-item] .picture-container {
  display: flex;
  height: fit-content;
  gap: 1vmin;
  flex-direction: row;
  flex-wrap: wrap;
}

div[thread-item] .picture {
  box-sizing: border-box;
  min-width: calc(50% - 1vmin);
  flex: 1;
  border-radius: 1vmax;
  object-fit: cover;
}

div[thread-item] .picture:hover {
  cursor: pointer;
}

div[thread-item] .picture:nth-child(2n) {
  flex-basis: calc(50% - 1vmin);
  aspect-ratio: 1/1;
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
</style>
