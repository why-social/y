<script setup>
import VueJwtDecode from 'vue-jwt-decode'
import { Api } from '@/Api'

import Input from '@/components/misc/Input.vue'
import Button from '@/components/misc/Button.vue'
</script>

<template>
  <div class="profile-header">
    <div class="profile-avatar-container">
      <div class="profile-avatar" @click="selectNewImage">
        <img :src="userData.avatarUrl" alt="avatar" id="avatarImg" />

        <div v-if="editMode" class="edit-overlay">
          <span class="edit-icon icon">edit</span>
        </div>

        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileChange"
          style="display: none"
        />
      </div>

      <div class="profile-name-container">
        <div class="profile-name">
          <template v-if="editMode">
            <Input
              customClass="profile-edit-input"
              v-model="editableUserData.name"
              required
            />
          </template>

          <template v-else>
            {{ userData.name }}
          </template>
        </div>
        <div class="username-email-container">
          <div class="profile-info">
            <span class="at-symbol">@</span>
            <span class="profile-username">{{ userData.username }}</span>
          </div>

          <div v-if="userData.email" class="profile-info">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="512px"
              height="512px"
              viewBox="0 0 512 512"
              style="enable-background: new 0 0 512 512"
              xml:space="preserve"
              class="email-icon"
            >
              <path
                d="M448,64H64C28.656,64,0,92.656,0,128v256c0,35.344,28.656,64,64,64h384c35.344,0,64-28.656,64-64V128
                C512,92.656,483.344,64,448,64z M342.656,234.781l135.469-116.094c0.938,3,1.875,6,1.875,9.313v256
                c0,2.219-0.844,4.188-1.281,6.281L342.656,234.781z M448,96c2.125,0,4,0.813,6,1.219L256,266.938L58,97.219
                C60,96.813,61.875,96,64,96H448z M33.266,390.25C32.828,388.156,32,386.219,32,384V128c0-3.313,0.953-6.313,1.891-9.313
                L169.313,234.75L33.266,390.25z M64,416c-3.234,0-6.172-0.938-9.125-1.844l138.75-158.563l51.969,44.531
                C248.578,302.719,252.297,304,256,304s7.422-1.281,10.406-3.875l51.969-44.531l138.75,158.563C454.188,415.062,451.25,416,448,416
                H64z"
              />
            </svg>

            <span class="profile-email">{{ userData.email }}</span>
          </div>
        </div>
      </div>

      <div class="profile-buttons">
        <template v-if="userData.isViewer">
          <template v-if="editMode">
            <Button secondary @click="toggleEditMode">Cancel</Button>
            <Button secondary @click="saveChanges">Save</Button>
          </template>

          <template v-else>
            <Button secondary @click="toggleEditMode">
              <span class="icon">edit</span>
            </Button>
          </template>
        </template>

        <template v-else>
          <Button v-if="!isFollowedByViewer" @click="follow">
            <span class="icon">person_add</span>
          </Button>
          <Button v-else secondary @click="unfollow">
            <span class="icon">person_remove</span>
          </Button>
        </template>
      </div>
    </div>

    <div class="profile-joinDate">Joined {{ userData.joinDate }}</div>

    <div class="profile-follow-container">
      <a class="profile-following" @click="$router.push({ name: 'followers' })">
        <span class="profile-follow-number">{{
          userData.followers.length
        }}</span>
        Followers
      </a>
      <a
        class="profile-followers"
        @click="$router.push({ name: 'followings' })"
      >
        <span class="profile-follow-number">{{
          userData.following.length
        }}</span>
        Following
      </a>
    </div>

    <div v-if="userData.about_me || editMode" class="profile-aboutme">
      <span v-if="userData.about_me">About me:</span>

      <template v-if="editMode">
        <Input
          customClass="profile-edit-input"
          v-model="editableUserData.about_me"
          modelValue="editableUserData.about_me"
          placeholder="About me"
        />
      </template>

      <template v-else>
        <div v-if="userData.about_me">{{ userData.about_me }}</div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  props: {
    userData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editMode: false,
      followers: this.userData.followers,
      editableUserData: {
        name: this.userData.name,
        about_me: this.userData.about_me
      }
    }
  },
  computed: {
    viewer() {
      return VueJwtDecode.decode(localStorage.getItem('token'))
    },
    isFollowedByViewer() {
      return this.followers.includes(this.viewer.username)
    }
  },
  watch: {
    userData: {
      handler(newValue) {
        this.editableUserData = { ...newValue }
      },
      deep: true
    }
  },
  methods: {
    async follow() {
      const response = await Api.post(
        `/v1/users/followings/${this.userData.username}`,
        null,
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      )

      if (response.status === 201) {
        const newFollowerList = this.followers
        newFollowerList.push(this.viewer.username)

        this.followers = newFollowerList
      }
    },

    async unfollow() {
      const response = await Api.delete(
        `/v1/users/followings/${this.userData._id}`,
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      )

      if (response.status === 200) {
        const newFollowerList = []

        this.followers.forEach((follower) => {
          if (follower !== this.viewer.username) {
            newFollowerList.push(follower)
          }
        })

        this.followers = newFollowerList
      }
    },

    toggleEditMode() {
      this.editMode = !this.editMode
      if (!this.editMode) {
        this.editableUserData = { ...this.userData }
        document.querySelector('#avatarImg').src = this.userData.avatarUrl
      }
    },

    async saveChanges() {
      console.log(this.editableUserData)

      // Check if the data has changed
      if (
        this.editableUserData.name === this.userData.name &&
        this.editableUserData.about_me === this.userData.about_me &&
        !this.editableUserData.avatar
      ) {
        return
      }

      this.$emit('updateUserData', this.editableUserData)
      this.toggleEditMode()
    },
    selectNewImage() {
      if (this.editMode) {
        // Only allow image selection in edit mode
        this.$refs.fileInput.click()
      }
    },
    handleFileChange(event) {
      if (event.target.files[0]) {
        if (event.target.files[0]) {
          this.editableUserData.avatar = event.target.files[0]
          document.querySelector('#avatarImg').src = URL.createObjectURL(
            event.target.files[0]
          )
        }
        this.$refs.fileInput.value = ''
      }
    }
  }
}
</script>

<style scoped>
.profile-header {
  pointer-events: all;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.profile-avatar-container {
  display: flex;
  width: 100%;
  gap: 1.5rem;
  box-sizing: border-box;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1.5rem;
}
.profile-avatar {
  position: relative;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
}
.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: content-box;
  padding: 3px; /* blur radius + 1 */
  margin-left: -3px;
  margin-top: -3px;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}
.edit-overlay:hover {
  backdrop-filter: blur(2px);
  background-color: rgba(0, 0, 0, 0.7);
}
.edit-icon {
  cursor: pointer;
  color: white;
  font-size: 2rem;
}
.profile-name-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.username-email-container {
  display: flex;
  flex-direction: column;
}
.profile-info {
  display: flex;
  align-items: center;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
}
.profile-username,
.profile-joinDate,
.profile-email {
  font-size: 1rem;
  color: #aaa;
}
.at-symbol {
  color: var(--color-on-background);
  margin-right: 0.5rem;
}
.email-icon {
  width: 16px;
  height: 16px;
  fill: var(--color-on-background);
  color: var(--color-on-background);
  margin-right: 0.5rem;
}
.profile-follow-container {
  display: flex;
  gap: 0.5rem;
}
.profile-followers,
.profile-following {
  text-decoration: none;
  font-size: 1rem;
  color: #aaa;
}
.profile-followers:hover,
.profile-following:hover {
  color: var(--color-on-background);
  text-decoration: underline;
  cursor: pointer;
}
.profile-follow-number {
  color: var(--color-on-background);
  font-weight: 600;
}
.profile-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: auto;
  align-self: flex-start;
}
.profile-buttons button {
  font-size: 1.2rem;
  padding: 0.2rem 0.7rem;
}

.profile-aboutme {
  font-size: 1rem;
  padding-top: 0.5rem;
}

.icon {
  user-select: none;
  font-variation-settings: 'wght' 400;
  font-size: 1.5rem;
  line-height: 80%;
}

.profile-buttons button {
  width: 3rem;
  height: 3rem;
}

@media (max-width: 630px) {
  .profile-avatar {
    width: 6rem;
    height: 6rem;
  }
}
</style>
