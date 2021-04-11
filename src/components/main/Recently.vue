<template>
  <div id="recently">
    <md-empty-state 
       v-if="recentlyClips.length===0" 
       md-icon="history"
       md-label="확인해본 클립이 없어요"
       md-description="검색에서 찾은 클립 중 미리보기를 보거나 새 창에서 열기, 클립보드로 주소 복사, 즐겨찾기에 등록한 클립들이 여기에 보여요">
    </md-empty-state>
    <clip-card
      v-for="twitchClip in reverse"
      v-bind:key="twitchClip.id"
      v-bind:twitch-clip="twitchClip"
      v-bind:IsRecentlyPage="true"
    >
    </clip-card>
  </div>
</template>

<script>
import TwitchActivityService from "../../service/twitch-activity.service";
import clipCard from "./clip-card";
export default {
  name: "Recently",
  components: {
    "clip-card": clipCard,
  },
  data() {
    return {
      recentlyClips: TwitchActivityService.recently
    };
  },
  computed: {
    reverse() {
      return this.$data.recentlyClips.slice().reverse();
    }
  }
};
</script>

<style scoped>
</style>