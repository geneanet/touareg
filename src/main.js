import App from './App.vue'
import Jobs from './Jobs.vue'
import Job from './Job.vue'
import TaskGroup from './TaskGroup.vue'
import Allocation from './Allocation.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import TaskConsole from './TaskConsole.vue'
import AllocSummary from './AllocSummary.vue'

import(/* webpackChunkName: "vuetify-css" */'../node_modules/vuetify/dist/vuetify.min.css')
import(/* webpackChunkName: "material-design-icons" */ 'webpack-material-design-icons')

var pVue = import(/* webpackChunkName: "vue" */ 'vue')
var pVueRouter = import(/* webpackChunkName: "vue-router" */ 'vue-router')
var pVuetify = import(/* webpackChunkName: "vuetify" */ 'vuetify')
var pMoment = import(/* webpackChunkName: "moment" */ 'moment')

Promise.all([pVue, pVueRouter, pVuetify, pMoment]).then(promises => {
    var Vue = promises[0].default
    var VueRouter = promises[1].default
    var Vuetify = promises[2].default
    var moment = promises[3]

    Vue.use(Vuetify)
    Vue.use(VueRouter)

    Vue.component('confirm-dialog', ConfirmDialog)
    Vue.component('task-console', TaskConsole)
    Vue.component('alloc-summary', AllocSummary)

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
})
