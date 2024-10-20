<template>
  <div class="discovery-search-container"></div>
</template>

<script>
export default {
  mounted() {
    const content = document.getElementById('content-container')
    const searchContainer = document.getElementById('search-container')
    const search = document.getElementById('search')

    content.style.flex = 'none'
    content.style.width = '0px'

    searchContainer.style.width = '100%'
    searchContainer.style.display = 'flex'
    searchContainer.style.paddingBottom = '10rem'

    search.style.width = '100%'
    search.style.transform = ''
    search.style.position = 'relative'

    document.body.scrollTop = 0
  },
  unmounted() {
    const content = document.getElementById('content-container')
    const searchContainer = document.getElementById('search-container')
    const search = document.getElementById('search')

    content.style.flex = ''
    content.style.width = ''

    searchContainer.style.width = ''
    searchContainer.style.display = ''
    searchContainer.style.paddingBottom = ''

    search.style.width = ''
    search.style.position = ''
  }
}
</script>

<style>
.discovery-search-container {
  width: 0px;
}
</style>
