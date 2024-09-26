<template>
  <div class="post-container">
    <img class="pfp" v-bind:src="pfp" />
    <div class="post-data">
      <div class="info">
        <span class="inter-tight-medium">{{ name }}</span>
        <span>@{{ username }}</span>
        <span class="inter-tight-medium">·</span>
        <span>{{ date }}</span>
      </div>
      <div class="post-content">
        <span class="content">{{ content }}</span>
        <img class="picture" v-bind:src="picture" />
      </div>
      <div class="interactions">
        <div class="clickble" ref="like">
          <span class="icon like" ref="like_icon" :class="{ liked: liked }"
            >favorite</span
          >
          <span>{{ likes }}</span>
        </div>
        <div class="clickable">
          <span class="icon">forum</span>
          <span>{{ comments }}</span>
        </div>
        <div class="repost inter-tight-medium">
          <span class="icon" style="font-variation-settings: 'wght' 400"
            >cached</span
          >
          <span style="padding-right: 0.4rem">Repost</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-container {
  user-select: none;
  display: flex;
  width: 100%;
  font-size: 1.4rem;
  padding: 2rem 2.5rem;
  gap: 1rem;
}
.pfp {
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
}
.post-data {
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}
.post-content {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}
.info {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
.info > span {
  opacity: 0.7;
}
.info > span:nth-child(1) {
  opacity: 1;
}
.picture {
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  object-fit: contain;
}
.interactions {
  display: flex;
  padding-top: 0.5rem;
  flex-direction: row;
}
.interactions > * {
  flex: 1;
}
.clickable {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.2rem;
}
.clickable > * {
  opacity: 0.7;
  transition: 0.5s;
}
.icon {
  cursor: pointer;
  font-size: 2rem;
}
.like:hover {
  opacity: 1;
  color: var(--color-like);
}
.liked {
  opacity: 1;
  color: var(--color-like);
  font-variation-settings: 'FILL' 1;
}
.liked:hover {
  opacity: 0.7;
  color: var(--color-on-background);
}
.repost {
  transition: 0.5s;
  cursor: pointer;
  background: var(--color-accent);
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  font-size: 1.5rem;
  align-items: center;
  justify-content: center;
  color: var(--color-on-accent);
  border-radius: 100rem;
}
.repost:hover {
  background: var(--color-accent-highlight);
}
</style>

<script>
export default {
  data() {
    return {
      name: 'Y User',
      username: 'deleted',
      pfp: 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg',
      date: 'Jan 1',
      content:
        "If you are homeless, just... buy a house!? I mean, that's what Obama did, right?",
      picture:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRccugr3pNwrjcc64YJ1GEy71vj1hCEhAE4OA&s',
      likes: '420K',
      comments: '69K',
      liked: true
    }
  },
  mounted() {
    this.$refs.like.addEventListener('click', () => {
      this.$refs.like_icon.classList.toggle('liked')
      // TODO: update db
    })
  }
}
</script>
