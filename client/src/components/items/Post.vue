<script>
import moment from 'moment'
import ThreadItem from './ThreadItem.vue'

export default {
  mixins: [ThreadItem],

  props: ['post'],

  data() {
    if (this.post) {
      return {
        user: this.post.author,
        avatar: this.post.author.profile_picture,
        date: moment(this.post.timestamp).fromNow(),
        content: this.post.content,
        images: this.post.images || [],
        likes: this.post.likes,
        comments: this.post.comments,
        liked: true,
        modalImageIndex: null,
        isModalOpen: false
      }
    } else {
      // placeholder post
      return {
        user: {
          name: 'Shawn Dawgson',
          username: 'colguylikesdawgs'
        },
        date: moment(new Date()).fromNow(),
        content: 'Can I pet that dawg',
        images: [
          'https://st3.depositphotos.com/29384342/34115/i/450/depositphotos_341157888-stock-photo-recommendation-sports-student.jpg',
          'https://randomwordgenerator.com/img/picture-generator/52e4d1424f5aa914f1dc8460962e33791c3ad6e04e5074417d2e72d2954ac5_640.jpg',
          'https://www.kdnuggets.com/wp-content/uploads/tree-todd-quackenbush-unsplash.jpg'
        ],
        likes: [],
        comments: [],
        liked: true,
        modalImageIndex: null,
        isModalOpen: false
      }
    }
  },

  methods: {
    get() {
      return this.post
    },
    like() {
      this.liked = !this.liked

      // TODO update database
    }
  },

  computed: {
    isLiked() {
      return this.liked
    }
  }
}
</script>
