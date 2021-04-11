import Vue from "vue";
import VueRouter from "vue-router";
import LoginComponent from "./components/Login.vue";
import LogOutComponent from "./components/LogOut.vue";
import TwitchApiService from "./service/twitch-api.service";
import MainComponent from "./components/Main.vue";
import FavoritesComponent from "./components/main/Favorites.vue";
import RecentlyComponent from "./components/main/Recently.vue";
import SearchComponent from "./components/main/Search.vue";

Vue.use(VueRouter);
export const router = new VueRouter({
    mode: "history",
    routes:[
        {
            path: "/",
            component: MainComponent,
            beforeEnter: (to, from, next)=> {
                TwitchApiService.IsValidate.subscribe((valid)=>{
                    if(valid) {
                        next();
                    } else {
                        next("/login");
                    }
                })
            },
            children: [
                {
                    path: "/",
                    redirect: "/favorites",
                },
                {
                    path: "/favorites",
                    component: FavoritesComponent,
                },
                {
                    path: "/recently",
                    component: RecentlyComponent,
                },
                {
                    path: "/search",
                    component: SearchComponent,
                }
            ]
        },
        {
            path:"/login",
            name: "login",
            component: LoginComponent
        },
        {
            path:"/logout",
            name: "LogOut",
            component: LogOutComponent,
            
        }
    ]
})