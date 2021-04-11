<template>
  <div></div>
</template>

<script>
import TwitchApiService from "../service/twitch-api.service";
export default {
  name:"LogOut",
  created() {
    TwitchApiService.Logout();
    this.$router.push("/");
  },
}
</script>

<style>

</style>