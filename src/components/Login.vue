<template>
  <div id="login">
    <p>
      <md-icon class="main-icon">attachment</md-icon>
    </p>
    <p>
      <span class="title">트위치 클립 검색기</span>
    </p>
    <p class="login-button">
      <md-button class="md-raised" :href="oauthURL">
        <!-- <md-icon :md-src="require('/assets/TwitchGlichBlackOps.svg')"></md-icon> -->
        <!-- <svg src="./assets/TwitchGlichBlackOps.svg"></svg> -->
        트위치로 로그인
      </md-button>
    </p>
  </div>
</template>

<script>
import TwitchApiService from "../service/twitch-api.service";

export default {
  name: "Login",
  data() {
    return {
      content: "Hello login",
      oauthURL: TwitchApiService.GetOAuthURL(),
    };
  },
  beforeCreate() {
    console.log(this.$route.hash);
    const urlParams = new URLSearchParams(this.$route.hash.slice(1));
    const access_token = urlParams.get("access_token");
    if (access_token) {
      TwitchApiService.access_token = access_token;
      TwitchApiService.IsValidate.subscribe((authorized) => {
        if (authorized) {
          this.$router.push("/");
        }
      });
    }
  },
};
</script>

<style scoped>
#login {
  display: block;
  position: absolute;
  width: 100%;
  height: 100vh;
  background-color: #673ab7 !important;
  text-align: center;
}

p {
  text-align: center;
}

.main-icon {
  display: inline-block;
  vertical-align: middle;
  font-size: 200px !important;
  width: 200px;
  height: 200px;
  color: #ffffff !important;
  
  text-align: center;
}

.title {
  font-size: 50px;
  font-style: bold;
  color: #ffffff;
  margin-right: 20px;
  margin-left: 20px;
}

.login-button {
  position: absolute;
  width: 100%;
  /* display: inline-block; */
  top: 70%;
  margin-left: auto;
  margin-right: auto;
}

.login-button a {
  vertical-align: middle;
}

.login-icon {
  padding-right: 10px;
}
</style>
