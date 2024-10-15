<template>
  <ThreadItem
    v-bind="$props"
    @like="this.like()"
    @delete="this.delete()"
    :dateFormat="this.dateFormat"
  >
    <Button
      secondary
      class="inter-tight-medium"
      @click.stop="this.repost()"
      style="margin-left: auto"
    >
      <span class="icon" style="font-variation-settings: 'wght' 400">
        cached
      </span>

      <span style="padding-right: 0.3rem">Repost</span>
    </Button>
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
      // TODO update post database
    },
    delete() {
      // TODO update post database
    },
    repost() {
      // TODO add repost logic
    }
  }
}
</script>
