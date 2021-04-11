
<template>
  <div id="main">
    <md-app md-mode="fixed" style="height: 100vh">
    <!-- <md-app md-mode="reveal" style="min-height: 100vh"> -->
      <md-app-toolbar class="md-primary">
        <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">트위치 클립 검색기</span>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button" @click="showDialog = !showDialog">
            <md-icon>search</md-icon>
          </md-button>
        </div>
      </md-app-toolbar>

      <md-app-drawer :md-active.sync="menuVisible">
        <md-toolbar class="md-transparent" md-elevation="0"
          >Navigation</md-toolbar
        >
        <md-list>
          <router-link to="/favorites" @click.native="menuVisible = false" >
            <md-list-item>
              <md-icon>bookmarks</md-icon>
              <span class="md-list-item-text">즐겨찾기</span>
            </md-list-item>
          </router-link>

          <router-link to="/recently" @click.native="menuVisible = false">
            <md-list-item>
              <md-icon>history</md-icon>
              <span class="md-list-item-text">최근 기록</span>
            </md-list-item>
          </router-link>

          <router-link to="/logout" @click.native="menuVisible = false">
            <md-list-item>
              <md-icon>logout</md-icon>
              <span class="md-list-item-text">로그아웃</span>
            </md-list-item>
          </router-link>
        </md-list>
      </md-app-drawer>
      <md-app-content>
        <router-view></router-view>
      </md-app-content>
    </md-app>
    <form novalidate>
      <md-dialog :md-active.sync="showDialog">
        <md-dialog-title>검색</md-dialog-title>
        <md-dialog-content id="search-content">
          <md-autocomplete
            v-model="form.channel"
            :md-options="searchedChannels"
            @md-changed="getChannels"
            :class="getValidationClass('channel')"
          >
            <label>채널 이름</label>
            <template v-slot:md-autocomplete-item="{ item, term }">
              <img class="channel-thumbnail" v-bind:src="item.thumbnail_url" />
              <!-- <div v-bind:style="{ backgroundImage: 'url(' + item.thumbnail_url + ')' }"></div> -->
              <md-highlight-text :md-term="term">
                {{ item.display_name }}
              </md-highlight-text>
            </template>
            <template v-slot:md-autocomplete-empty="{ term }">
              <span v-if="term">{{ term }}으로 검색된 채널이 없습니다</span>
              <span v-else>검색어를 입력하세요</span>
            </template>
            <span class="md-error" v-if="!$v.form.channel.required">
              채널을 선택해주세요.
            </span>
            <span class="md-error" v-else-if="!$v.form.channel.channelSelected">
              검색된 채널 목록 중에서 선택해주세요.
            </span>
          </md-autocomplete>
          <!-- <md-field>
            <label for="channel-id">채널 이름</label>
            <md-input name="channel-id" id="search-channel-id" />
          </md-field> -->
          <!-- <md-field> -->
          <div>
            <md-datepicker v-model="form.startDate">
              <label>시작일</label>
            </md-datepicker>
            <md-datepicker v-model="form.endDate">
              <label>종료일</label>
            </md-datepicker>
          </div>

          <md-field>
            <label for="title">제목</label>
            <md-input v-model="form.title" name="title" id="search-title" />
          </md-field>
          <md-field>
            <label for="creator_name">제작자</label>
            <md-input
              v-model="form.creator_name"
              name="creator_name"
              id="search-creator_name"
            />
          </md-field>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="showDialog = false"
            >닫기</md-button
          >
          <md-button type="submit" class="md-primary" @click="validateQuery">
            검색
          </md-button>
        </md-dialog-actions>
      </md-dialog>
    </form>
  </div>
</template>

<script>
import { Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
} from "rxjs/operators";
import twitchApiService from "../service/twitch-api.service";
import SearchQuery from "../library/search-query";
import { required } from "vuelidate/lib/validators";
export default {
  name: "Main",
  data() {
    return {
      form: {
        channel: null,
        title: "",
        creator_name: "",
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
      menuVisible: false,
      showDialog: false,
      searchQueries: new Subject(),
      searchQueriesSub: null,
      searchedChannels: [],
    };
  },
  validations: {
    form: {
      channel: {
        channelSelected: (channel) => {
          if (channel && Object.prototype.hasOwnProperty.call(channel, "id")) {
            return true;
          } else {
            return false;
          }
        },
        required,
      },
      startDate: {
        required,
      },
      endDate: {
        required,
      },
    },
  },
  created() {
    const query = SearchQuery.FromQueries(this.$route.query);
    if (query.broadcaster_id.length > 0) {
      twitchApiService
        .GetUsers([query.broadcaster_id[0]])
        .subscribe((value) => {
          this.$data.form.channel = this.convertAutocomplete(value[0]);
        });
    }
    if (query.title.length > 0) {
      this.$data.form.title = query.title[0];
    }
    if (query.creator_name > 0) {
      this.$data.form.creator_name = query.creator_name[0];
    }
    if (query.start) {
      this.$data.form.startDate = query.start;
    }
    if (query.end) {
      this.$data.form.endDate = query.end;
    }
    this.$data.searchQueries
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((query) => twitchApiService.SearchChannels(query)),
        map((data) => data.map((value) => this.convertAutocomplete(value)))
      )
      .subscribe((value) => {
        this.$data.searchedChannels = value;
      });
    //
  },
  // subscriptions() {
  //   return {
  //     searchedChannels:
  //   };
  // },
  // computed: {
  //   searchTerm: function () {
  //     return this.$data.searchedChannels.map((value) =>
  //
  //     );
  //   },
  // },
  methods: {
    getChannels(searchTerm) {
      //this.$v.form["channel"].$touch();
      this.$data.searchQueries.next(searchTerm);
    },
    convertAutocomplete(value) {
      return Object.assign({}, value, {
        toLowerCase: function () {
          return this.display_name.toLowerCase();
        },
        toString: function () {
          return this.display_name;
        },
      });
    },
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];

      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty,
        };
      }
    },
    validateQuery() {
      this.$v.form.channel.$touch();
      this.$v.$touch();
      if (!this.$v.$invalid) {
        const form = this.$data.form;
        // const searchQuery = {
        //   broadcaster_id: form.channel.id,
        //   start: SearchQuery.dateToStr(form.startDate),
        //   end: SearchQuery.dateToStr(form.endDate)
        // };
        // if(form.title) {
        //   searchQuery.title = form.title;
        // }
        // if(form.creator_name) {
        //   searchQuery.creator_name =form.creator_name;
        // }
        // this.$data.showDialog = false;
        // const urlsearchParams = new URLSearchParams(searchQuery);
        if(form.startDate.getTime()>form.endDate.getTime()) {
          const temp = form.startDate;
          form.startDate = form.endDate;
          form.endDate =  temp;
        }
        const searchQuery = new SearchQuery({
          broadcaster_id: [form.channel.id],
          start: form.startDate,
          end: form.endDate,
        });
        if (form.title) {
          searchQuery.title.push(form.title);
        }
        if (form.creator_name) {
          searchQuery.creator_name.push(form.creator_name);
        }
        this.$data.showDialog = false;
        if (
          searchQuery.QueryURL !==
          SearchQuery.FromQueries(this.$route.query).QueryURL
        ) {
          this.$router.push({ path: "search", query: searchQuery.toObject() });
        }
      }
    },
  },
};
</script>

<style scoped>
md-app {
  height: 100vh;
  /* min-height: 100vh; */
}
#search-content {
  padding: 0px 12px;
}

.md-dialog-container:not(.md-dialog-fullscreen) {
  width: 80%;
}
.md-dialog-content {
  overflow-x: hidden;
}
.channel-thumbnail {
  height: 30px;
  width: 30px;
  margin: 0px 5px 0px 0px;
}
.md-field {
  margin-bottom: 12px;
}
.md-datepicker {
  width: 50%;
  display: inline-flex;
}
</style>

<style >
.md-menu-content {
  z-index: 20;
}
</style>