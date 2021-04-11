<template>
  <div id="search">
    <!-- <ul>
      <li v-for="twitchClip in filteredTwitchClip" v-bind:key="twitchClip.id">
        <clip-card v-bind:twitch-clip="twitchClip"> </clip-card>
      </li>
    </ul> -->
    <clip-card 
      v-for="twitchClip in filteredTwitchClip" 
      v-bind:key="twitchClip.id"
      v-bind:twitch-clip="twitchClip"> 
    </clip-card>
  </div>
</template>

<script>
// import { tap } from "rxjs/operators";
import twitchClipSearchService from "../../service/twitch-clip-search.service";
import SearchQuery from "../../library/search-query";
import clipCard from "./clip-card.vue";
export default {
  components: {
    "clip-card": clipCard,
  },
  name: "Search",
  data() {
    return {
      rawTwitchClips: [],
      searchQuery: new SearchQuery(),
    };
  },
  computed: {
    filteredTwitchClip() {
      return this.$data.rawTwitchClips.filter((value) =>
        this.$data.searchQuery.filter(value)
      );
    },
  },
  beforeCreate() {},
  created() {
    const self = this;
    this.$data.searchQuery = SearchQuery.FromQueries(this.$route.query);
    twitchClipSearchService
      .GetClipsLongDate(
        this.$data.searchQuery.broadcaster_id[0],
        this.$data.searchQuery.start,
        this.$data.searchQuery.end
      )
      .subscribe((twitchClips) => {
        self.$data.rawTwitchClips = twitchClips;
      });
  },
  watch: {
    $route() {
      const self = this;
      this.$data.searchQuery = SearchQuery.FromQueries(this.$route.query);
      twitchClipSearchService
        .GetClipsLongDate(
          this.$data.searchQuery.broadcaster_id[0],
          this.$data.searchQuery.start,
          this.$data.searchQuery.end
        )
        .subscribe((twitchClips) => {
          self.$data.rawTwitchClips = twitchClips;
        });
    },
  },
};
</script>

<style>
</style>