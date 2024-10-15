<template>
  <ThreadItem
    v-bind="$props"
    @like="this.like()"
    @delete="this.delete()"
    :dateFormat="this.dateFormat"
  >
  </ThreadItem>
</template>

<script>
export default {
  props: {
    dateFormat: {
      type: String,
      required: true
    }
  },

  methods: {
    like() {
      // TODO update comment database
    },
    delete() {
      // TODO update comment database
    }
  }
}
</script>
