import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuetify from 'vuetify'

import moment from 'moment'

import App from './App.vue'
import Jobs from './Jobs.vue'
import Job from './Job.vue'
import TaskGroup from './TaskGroup.vue'
import Allocation from './Allocation.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import TaskConsole from './TaskConsole.vue'

import('../node_modules/vuetify/dist/vuetify.min.css')

Vue.use(Vuetify)
Vue.use(VueRouter)

Vue.component('confirm-dialog', ConfirmDialog)
Vue.component('task-console', TaskConsole)

Vue.filter('formatNanoTimestamp', function(value) {
  if (value) {
    return moment.unix(Math.floor(value / 1000000000)).format('DD/MM/YYYY HH:mm:ss')
  }
})

Vue.filter('formatNanoTimestampRelative', function(value) {
  if (value) {
    return moment.unix(Math.floor(value / 1000000000)).fromNow()
  }
})

const routes = [
    { name:'jobs', path: '/', component: Jobs, meta: { title: 'Jobs' } },
    { name: 'job', path: '/job/:jobid', component: Job, props: true, meta: { title: 'Job' } },
    { name: 'taskgroup', path: '/job/:jobid/:tgid', component: TaskGroup, props: true, meta: { title: 'Task Group' } },
    { name: 'allocation', path: '/allocation/:allocid', component: Allocation, props: true }
]

const router = new VueRouter({
  routes: routes
})

let app = new Vue({
    router: router,
    el: '#app',
    render: h => h(App)
})
