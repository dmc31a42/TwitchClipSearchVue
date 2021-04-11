import Vue from 'vue'
import App from './App.vue'
import {router} from './router'
import VueRx from 'vue-rx';
import VueMaterial from "vue-material";
import VMdDateRangePicker from "v-md-date-range-picker";
import Vuelidate from "vuelidate";
import VueMoment from "vue-moment";
import VueClipboard from "vue-clipboard2";
Vue.config.productionTip = false

Vue.use(VueRx);
Vue.use(VueMaterial);
Vue.use(VMdDateRangePicker);
Vue.use(Vuelidate);
Vue.use(VueMoment);
Vue.use(VueClipboard);

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')

