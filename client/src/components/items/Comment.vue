<template>
  <ThreadItem
    v-bind="$props"
    @like="like"
    @unlike="unlike"
    @delete="deleteComment"
  >
  </ThreadItem>
</template>

<script>
import { Api } from '@/Api'

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
    deleteComment() {
      // TODO update comment database
    }
  }
}
</script>
