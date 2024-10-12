<script>
import { Api } from '@/Api'
import ThreadPrompt from './ThreadPrompt.vue'

export default {
  extends: ThreadPrompt,

  methods: {
    post(formData) {
      Api.post('v1/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then((response) => {
          console.log('Post created successfully:', response.data)
        })
        .catch((error) => {
          console.error('Error creating post:', error)
        })
    },
    getPlaceholder() {
      return 'What are you thinking about?'
    },
    getSubmitMessage() {
      return 'Post'
    }
  }
}
</script>
