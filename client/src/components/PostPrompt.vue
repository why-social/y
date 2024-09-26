<template>
  <div id="post-form">
    <form action="post">
      <div class="avatar-and-text">
        <img class="avatar" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"/>
        <input class="text-input" id="content" type="text" placeholder="What are you thinking about?">
      </div>
      <label class="attach-label" for="images">
        <!-- TODO: Replace placeholder icon -->
        <img class="attach-icon" src="https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/128/Downloads-icon.png"/>
      </label>
        <input class="file-input" id="images" type="file" multiple>
      <input type="submit" value="Post">
    </form>
  </div>
</template>

<script>

</script>

<style scoped>
#post-form {
  padding: 2rem 2.5rem;
  width: 100%;
}

.avatar-and-text {
  display: flex;
  gap: 1rem;
}

.avatar {
  width: 5rem;
  align-self: center;
  border-radius: 100%;
}

input[type=text] {
  width: 100%;
  height: 6rem;
  padding: 1rem 1rem 1rem 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  background: var(--color-background);
  color: var(--color-on-background);
  resize: vertical;
  border: none;
  border-bottom: 1px solid var(--color-border);
}

input[type=submit] {
  float: right;
  border: none;
  color: var(--color-on-accent);
  background: var(--color-accent);
  padding: 12px 20px;
  border-radius: 2rem;
  transition: 0.5s;
}

input[type=submit]:hover {
  border: 1px solid var(--color-accent);
  background: var(--color-on-background);
}

.attach-label {
  float: left;
  cursor: pointer;
}

.file-input {
  display: none;
  float: left;
}

.attach-icon {
  width: 2rem;
}

</style>
