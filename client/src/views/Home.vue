<template>
  <b-container id="container">
    <NavBar />
    <div id="content">
      <PostPrompt />
      <Post />
      <Post />
      <Post />
    </div>
  </b-container>
</template>

<style scoped>
#container {
  width: 100%;
  display: flex;
  flex-direction: row;
  margin: 0;
  padding: 0;
}

#content {
  display: block;
  height: 100%;
}
</style>
