<script setup>
import { Api } from '@/Api'

import Post from '@/components/items/Post.vue'
import Comment from '@/components/items/Comment.vue'
import Spinner from '@/components/Spinner.vue'
import CommentPrompt from '@/components/prompts/CommentPrompt.vue'
</script>

<template>
  <div id="thread-container">
    <template v-if="isLoaded">
      <div
        class="thread-parent"
        :class="{ hidden: !parent_id }"
        @click.stop="goToParent"
      >
        <span class="icon" style="font-variation-settings: 'wght' 300"
          >step_out</span
        >
        <span style="padding-right: 0.7rem">Original thread</span>
      </div>

      <template v-if="isLoaded">
        <template v-if="type == 'post'">
          <Post :item="head" />
        </template>

        <template v-if="type == 'comment'">
          <Comment :item="head" />
        </template>
      </template>

      <template v-else>
        <Spinner />
      </template>

      <hr />

      <CommentPrompt
        v-if="!head.is_deleted"
        :parent="head?._id"
        :parentIsPost="type == 'post'"
      />

      <template v-if="head?.comments?.length">
        <hr />

        <Comment
          v-for="comment in head.comments"
          :item="comment"
          :key="comment._id"
        />
      </template>
    </template>

    <template v-else>
      <Spinner />
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoaded: false,
      type: null,
      head: null
    }
  },

  computed: {
    parent_id() {
      if (this.type) {
        if (this.type === 'post') {
          return this.head.original_post?._id
        } else {
          return this.head.parent_id
        }
      }

      return null
    }
  },

  methods: {
    async getComment() {
      try {
        const response = await Api.get(
          `/v1/comments/${this.$route.params.id}`,
          {
            headers: {
              Authorization: localStorage.getItem('token')
            }
          }
        )

        return response.data
      } catch (error) {
        return null
      }
    },

    async getPost() {
      try {
        const response = await Api.get(`/v1/posts/${this.$route.params.id}`, {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        })

        return response.data
      } catch (error) {
        return null
      }
    },

    goToParent() {
      this.$router.push(`/thread/${this.parent_id}`)
    },

    refreshOnId() {
      this.$router.go()
    }
  },

  mounted() {
    document.body.scrollTo(0, 0)

    this.getPost()
      .then(async (result) => {
        if (result) {
          this.type = 'post'
        } else {
          result = await this.getComment()

          if (result) {
            this.type = 'comment'
          } else {
            this.$router.push('/404')

            return false
          }
        }

        this.head = result
      })
      .finally(() => {
        this.isLoaded = true

        return true
      })
  },

  watch: {
    '$route.params.id': 'refreshOnId'
  }
}
</script>

<style scoped>
#thread-container {
  pointer-events: all;
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
  margin-top: 1rem;
  padding: 0.7rem;
  transition: 0.3s background;
  border-radius: 100vmax;
}

.thread-parent:hover {
  background: var(--color-background-highlight);
}

.icon {
  font-size: 2rem;
  line-height: 80%;
}

.hidden {
  display: none;
}

@media (max-width: 630px) {
  .icon {
    font-size: 1.5rem;
    line-height: 80%;
  }

  #thread-container {
    padding-bottom: 10rem;
  }
}
</style>
