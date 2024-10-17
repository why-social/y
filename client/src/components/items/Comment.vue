<template>
  <ThreadItem
    v-bind="$props"
    @like="like"
    @unlike="unlike"
    @edit="edit"
    @delete="deleteComment"
  >
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
      Api.post(`/v1/comments/${this.item._id}/likes`, null, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
    },
    unlike() {
      Api.delete(`/v1/comments/${this.item._id}/likes/${this.viewer.userId}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
    },
    async deleteComment() {
      const response = await Api.delete(`/v1/comments/${this.item._id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })

      if (response.status === 200) {
        this.$router.go()
      }
    },
    async edit(payload) {
      await Api.patch(`/v1/comments/${this.item._id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: localStorage.getItem('token')
        }
      })
    }
  },

  computed: {
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token'))
    }
  }
}
</script>
