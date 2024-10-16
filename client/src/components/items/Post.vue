<template>
  <ThreadItem
    v-bind="$props"
    @like="like"
    @unlike="unlike"
    @edit="edit"
    @delete="deletePost"
  >
    <Button
      v-if="item.author._id !== viewer.userId"
      secondary
      class="inter-tight-medium"
      @click.stop="this.repost()"
      style="margin-left: auto"
    >
      <span class="icon" style="font-variation-settings: 'wght' 400"
        >cached</span
      >
      <span style="padding-right: 0.3rem">Repost</span>
    </Button>
  </ThreadItem>
</template>

<script>
import { Api } from '@/Api'
import VueJwtDecode from 'vue-jwt-decode'

export default {
  props: {
    dateFormat: {
      type: String
    },
    item: {
      type: Object,
      required: true
    }
  },

  methods: {
    like() {
      Api.post(`/v1/posts/${this.item._id}/likes`, null, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
    },
    unlike() {
      Api.delete(`/v1/posts/${this.item._id}/likes/${this.viewer.userId}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
    },
    async deletePost() {
      const response = await Api.delete(`/v1/posts/${this.item._id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      if (response.status === 200) {
        this.$router.go()
      }
    },
    edit() {
      // TODO
    },
    repost() {
      Api.post(
        '/v1/posts/repost',
        { postId: this.item._id },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      )
    }
  },

  computed: {
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token'))
    }
  }
}
</script>
