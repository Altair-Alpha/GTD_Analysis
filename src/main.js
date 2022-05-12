import Vue from 'vue'
import App from './App.vue'
import globalData from './assets/js/global.data.js'
import VueRouter from 'vue-router'

Vue.prototype.GLOBAL = globalData

Vue.config.productionTip = false

Vue.use(globalData)
Vue.use(VueRouter)

new Vue({
  render: h => h(App),
}).$mount('#app')
