import App from './App.vue'
import JobsList from './JobsList.vue'
import JobDetails from './JobDetails.vue'
import TaskGroup from './TaskGroup.vue'
import AllocationDetails from './AllocationDetails.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import TaskConsole from './TaskConsole.vue'
import AllocSummary from './AllocSummary.vue'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import moment from 'moment'

// import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const app = createApp(App)
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { name:'jobs', path: '/', component: JobsList, meta: { title: 'Jobs' } },
        { name: 'job', path: '/job/:jobid', component: JobDetails, props: true, meta: { title: 'Job' } },
        { name: 'taskgroup', path: '/job/:jobid/:tgid', component: TaskGroup, props: true, meta: { title: 'Task Group' } },
        { name: 'allocation', path: '/allocation/:allocid', component: AllocationDetails, props: true }
    ]
})  
const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
})

app.config.globalProperties.$filters = {
    formatNanoTimestamp(value) {
        if (value) {
            return moment.unix(Math.floor(value / 1000000000)).format('DD/MM/YYYY HH:mm:ss')
        }
    },

    formatNanoTimestampRelative(value) {
        if (value) {
            return moment.unix(Math.floor(value / 1000000000)).fromNow()
        }
    },
}

app.use(router)
app.use(vuetify)

app.component('confirm-dialog', ConfirmDialog)
app.component('task-console', TaskConsole)
app.component('alloc-summary', AllocSummary)

app.config.globalProperties.nomad_url = window.nomad_url
app.config.globalProperties.nomad_node_url = window.nomad_node_url
app.config.globalProperties.consul_url = window.consul_url

app.mount('#app')

