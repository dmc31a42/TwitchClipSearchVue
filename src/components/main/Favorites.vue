<template>
  <div id="favorites">
     <md-empty-state 
       v-if="favorites.length===0" 
       md-icon="bookmarks"
       md-label="즐겨찾기한 클립이 없어요"
       md-description="검색 또는 검색 기록에서 북마크 버튼을 눌러서 즐겨찾기에 등록하세요">
     </md-empty-state>
     <clip-card
      v-for="twitchClip in reverse"
      v-bind:key="twitchClip.id"
      v-bind:twitch-clip="twitchClip"
    >
    </clip-card>
  </div>
</template>

<script>
import TwitchActivityService from "../../service/twitch-activity.service";
import clipCard from "./clip-card";
export default {
  name: "Favorites",
  data() {
    return {
      favorites: TwitchActivityService.favorites
    };
  },
  components: {
    "clip-card": clipCard,
  },
  computed: {
    reverse() {
      return this.$data.favorites.slice().reverse();
    }
  }
};
</script>

<style scoped>
</style>