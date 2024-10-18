<template>
  <div class="discovery-search-container"></div>
</template>

<script>
export default {
  mounted() {
    const content = document.getElementById('content-container')
    const searchContainer = document.getElementById('search-container')

    content.style.flex = 'none'
    content.style.width = '0px'

    searchContainer.style.width = '100%'
    searchContainer.style.display = 'flex'
  },
  unmounted() {
    const content = document.getElementById('content-container')
    const searchContainer = document.getElementById('search-container')

    content.style.flex = ''
    content.style.width = ''

    searchContainer.style.width = ''
    searchContainer.style.display = ''
  }
}
</script>

<style>
.discovery-search-container {
  width: 0px;
}
</style>
