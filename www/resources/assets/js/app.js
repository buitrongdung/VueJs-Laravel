import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueBreadcrumbs from 'vue-breadcrumbs'
import VueProgressBar from 'vue-progressbar'

import router from './routes'
import Sidebar from './components/views/layouts/Sidebar.vue'

Vue.use(VueAxios, axios);
Vue.use(VueBreadcrumbs, {
    template: '<div id="breadcrumb" v-if="$breadcrumbs.length">' +
    '<router-link class="breadcrumb-item" v-for="(crumb, key) in $breadcrumbs" :to="linkProp(crumb)" :key="key">{{ crumb | crumbText }}</router-link> ' +
    '</div>'});
Vue.use(VueProgressBar, {color: 'rgb(143, 255, 199)',failedColor: 'red',height: '2px'});


window.onload = function () {
    new Vue({
        router,
        components: {
            Sidebar
        }
    }).$mount('#home-app');
};
