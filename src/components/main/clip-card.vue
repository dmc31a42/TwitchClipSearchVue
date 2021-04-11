<template>
  <md-card>
    <md-card-header>
      <div class="md-title title">{{twitchClip.title}}</div>
      <div class="md-subhead">
        <span>{{twitchClip.broadcaster_name}}</span>
        <span class="date">{{dateFormat}}</span>
      </div>
    </md-card-header>
    <md-card-media md-ratio="16:9">
        <div class="spinner-placehold overlap thumbnail">
            <md-progress-spinner></md-progress-spinner>
      </div>
      <img class="overlap thumbnail" v-if="!ShowIframe" :src="twitchClip.thumbnail_url" @click="ShowIframe = true;addRecently();">
      <iframe class="overlap thumbnail" v-if="ShowIframe" frameBorder="0" :src="getEmbedURL" scrolling="no" allowfullscreen="true"></iframe>
    </md-card-media>
    <md-card-content>
      <p>
        클립 제작: {{twitchClip.creator_name}}
      </p>
    </md-card-content>
    <md-card-actions>
      <md-button :href="twitchClip.url" target="_blank" @click="addRecently">
        <md-icon>open_in_new</md-icon>
        <md-tooltip md-direction="bottom">새 페이지에서 클립 보기</md-tooltip>
      </md-button>
      <md-button @click="copyToClipboard();addRecently();">
        <md-icon>link</md-icon>
        <md-tooltip md-direction="bottom">클립보드에 클립 주소 복사</md-tooltip>
      </md-button>
      <md-button v-if="!IsFavorite" @click="addFavorite();addRecently();">
        <md-icon>bookmark_border</md-icon>
        <md-tooltip md-direction="bottom">북마크에 클립을 추가</md-tooltip>
      </md-button>
      <md-button v-if="IsFavorite" @click="removeFavorite">
        <md-icon>bookmark</md-icon>
        <md-tooltip md-direction="bottom">북마크에서 클립을 제거</md-tooltip>
      </md-button>
      <md-button v-if="IsRecentlyPage" @click="removeRecently">
        <md-icon>clear</md-icon>
        <md-tooltip md-direction="bottom">최근 기록에서 제거</md-tooltip>
      </md-button>
    </md-card-actions>
  </md-card>
</template>

<script>
import TwitchActivityService from "../../service/twitch-activity.service";
export default {
  name: "ClipCard",
  data() {
    return {
      ShowIframe: false,
      IsFavorite: false,
    }
  },
  props: {
    twitchClip: Object,
    IsRecentlyPage: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.$data.IsFavorite = this.isFavoriteCheck();
  },
  methods: {
    copyToClipboard: function() {
      this.$copyText(this.$props.twitchClip.url);
    },
    addRecently: function() {
      if(this.$route.fullPath !== "/recently") {
        const index = TwitchActivityService.recently.findIndex((val)=>val.id === this.$props.twitchClip.id);
        if(index !== -1) {
          TwitchActivityService.recently.splice(index,1);
        }
        TwitchActivityService.recently.push(this.$props.twitchClip);
      }
    },
    removeRecently: function() {
      const index = TwitchActivityService.recently.findIndex((val)=>val.id === this.$props.twitchClip.id);
      TwitchActivityService.recently.splice(index, 1);
    } ,
    addFavorite: function() {
      TwitchActivityService.favorites.push(this.$props.twitchClip);
      this.$data.IsFavorite = true;
    },
    removeFavorite: function() {
      const index = TwitchActivityService.favorites.findIndex((val)=>val.id===this.$props.twitchClip.id);
      TwitchActivityService.favorites.splice(index, 1);
      this.$data.IsFavorite = false;
    },
    isFavoriteCheck: function() {
      return TwitchActivityService.favorites.findIndex((val)=>val.id === this.$props.twitchClip.id) !== -1;
    }
  },
  computed: {
    dateFormat: function() {
      return this.$moment(this.$props.twitchClip.created_at).format("YYYY/MM/DD HH:mm");
    },
    getEmbedURL: function() {
      return `${this.$props.twitchClip.embed_url}&parent=${window.location.hostname}&muted=false`;
    },
  }
}
</script>

<style scoped>
.date {
    float: right;
}
.title{
    font-size: 16px;
    width: 100%;
}
.overlap {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    transform: translateY(-50%);
}
.thumbnail {
    width: 100% !important;
    height: 100% !important;
}
md-card-media .spinner-placehold {
    width:100%;
    height: 100%;
    display: flex; 
    justify-content: center; 
    align-items: center;
}
.md-card-content {
    padding-bottom: 0px;
    padding-top: 0px;
}
.md-card-actions {
    padding-top: 0px;
}
.md-card-actions .md-button{
    min-width: 32px;
}
.md-card {
  margin-bottom: 10px;
}

</style>