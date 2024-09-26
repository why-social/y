<template>
  <form action="post">
    <div class="form-container">
      <div class="form-row">
        <img class="avatar" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"/>
        <input class="text-input" id="content" type="text" placeholder="What are you thinking about?">
      </div>
      <div class="form-row">
        <label class="attach-label" for="images">
          <span class="material-symbols-outlined attach-icon">attach_file</span>
        </label>
        <input class="file-input" id="images" type="file" multiple>
        <input type="submit" value="Post">
      </div>
    </div>
  </form>
</template>

<script>

</script>

<style scoped>
form {
  padding: 2rem 2.5rem 1rem;
  overflow: hidden;
  width: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.buttons {
  justify-content: space-between;
  margin-left: auto;
}

.avatar {
  width: 5rem;
  align-self: center;
  border-radius: 100%;
}

input[type=text] {
  flex-grow: 1;
  height: 5rem;
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
  border: 1px solid transparent;
  transition: 0.5s;
}

input[type=submit]:hover {
  border: 1px solid var(--color-accent);
  background: var(--color-on-background);
}

.attach-label {
  margin-left: auto;
  align-items: center;
  cursor: pointer;
}

.attach-icon {
  color: var(--color-accent);
  vertical-align: center;
}

.file-input {
  display: none;
  float: left;
}

.attach-icon {
  width: 2rem;
}

</style>
