<template>
  <div id="recently">
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

<style>
</style>