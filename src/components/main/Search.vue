<template>
  <div id="search">
    <!-- <ul>
      <li v-for="twitchClip in filteredTwitchClip" v-bind:key="twitchClip.id">
        <clip-card v-bind:twitch-clip="twitchClip"> </clip-card>
      </li>
    </ul> -->
    <md-snackbar
      md-position="center"
      :md-duration="Infinity"
      :md-active.sync="showSnackbar"
      md-persistent
    >
      <span>트위치에서 클립을 불러오고 있습니다.</span>
    </md-snackbar>
    <md-empty-state 
       v-if="showSnackbar===false && filteredTwitchClip.length===0" 
       md-icon="not_listed_location"
       md-label="검색 결과가 없습니다."
       md-description="다른 조건으로 검색해보세요. 제목, 클립 제작자를 공란으로 두거나 검색 범위를 넓혀보세요">
     </md-empty-state>
    <clip-card
      v-for="twitchClip in filteredTwitchClip"
      v-bind:key="twitchClip.id"
      v-bind:twitch-clip="twitchClip"
    >
    </clip-card>
  </div>
</template>

<script>
// import { tap } from "rxjs/operators";
import twitchClipSearchService from "../../service/twitch-clip-search.service";
import SearchQuery from "../../library/search-query";
import clipCard from "./clip-card.vue";
import { finalize } from "rxjs/operators";
export default {
  components: {
    "clip-card": clipCard,
  },
  name: "Search",
  data() {
    return {
      rawTwitchClips: [],
      searchQuery: new SearchQuery(),
      showSnackbar: true,
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
      .pipe(
        finalize(() => {
          self.$data.showSnackbar = false;
        })
      )
      .subscribe((twitchClips) => {
        self.$data.rawTwitchClips = twitchClips;
      });
  },
  watch: {
    $route() {
      this.$data.showSnackbar = true;
      const self = this;
      this.$data.searchQuery = SearchQuery.FromQueries(this.$route.query);
      twitchClipSearchService
        .GetClipsLongDate(
          this.$data.searchQuery.broadcaster_id[0],
          this.$data.searchQuery.start,
          this.$data.searchQuery.end
        )
        .pipe(
          finalize(() => {
            self.$data.showSnackbar = false;
          })
        )
        .subscribe((twitchClips) => {
          self.$data.rawTwitchClips = twitchClips;
        });
    },
  },
};
</script>

<style scoped>
</style>