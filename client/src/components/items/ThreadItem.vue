<template>
  <div thread-item @click="goToThread">
    <img v-if="isRepost" class="avatar" :src="originalAuthor.profile_picture" @click.stop="goToUser(originalAuthor._id)" />
    <img v-else class="avatar" :src="avatar" @click.stop="goToUser(user._id)" />

    <div class="data">
      <div v-if="isRepost" class="reposter-data" @click.stop="goToUser(author._id)">
        <span class="icon">cached</span>
        <img :src="avatar" />
        <span class="handle-link">@{{ author.username }}</span>
        <span>reposted</span>
      </div>
      <template v-if="isRepost">
        <div class="name" @click.stop="goToUser(originalAuthor._id)">
          <span class="inter-tight-medium">{{ originalAuthor.name }}</span>
          <span>@{{ originalAuthor.username }}</span>
        </div>
      </template>
      <template v-else>
        <div class="name" @click.stop="goToUser(author._id)">
          <span class="inter-tight-medium">{{ author.name }}</span>
          <span>@{{ author.username }}</span>
        </div>
      </template>

      <div class="content">
        <span :class="{ hidden: !this.content?.length }">{{ content }}</span>

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
import VueJwtDecode from 'vue-jwt-decode'

export default {
  props: ['item', 'dateFormat'],

  data() {
    const obj = {
      author: this.item.author,
      avatar: this.item.author?.profile_picture,
      date: moment(this.item.timestamp),
      content: this.item.content,
      images: this.item.images || [],
      likes: this.item.likes,
      comments: this.item.comments,
      modalImageIndex: null,
      isModalOpen: false,
      isRepost: !!this.item.original_post_id
    }

    if (this.dateFormat === 'now') {
      obj.date = obj.date.fromNow()
    } else {
      obj.date = obj.date.format('MMMM Do YYYY, hh:mm')
    }

    if (obj.isRepost) {
      obj.originalAuthor = this.item.original_post_id.author
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
    goToUser(userId) {
      this.$router.push(`/profile/${userId}`)
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
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token'))
    },
    liked() {
      return this.likes.includes(this.viewer.userId)
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

.reposter-data:hover .handle-link {
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
</style>
