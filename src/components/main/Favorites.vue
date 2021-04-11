<template>
  <div id="favorites">
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