<style>

</style>

<template>

    <v-app-bar color="blue" scroll-behavior="elevate">
        <v-app-bar-nav-icon @click="$router.push({ name: 'jobs'})">
            <v-icon :icon="mdiHome"/>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Jobs</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field hide-details variant="solo" density="compact" autofocus clearable :prepend-inner-icon="mdiMagnify" placeholder="Filter..." v-model="filter"></v-text-field>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-menu location="bottom left">
            <template v-slot:activator="{ props }">
                <v-btn icon v-bind="props">
                    <v-icon :icon="mdiDotsVertical"/>
                </v-btn>
            </template>
            <v-list light>
                <v-list-item @click="reloadPHP()">
                    <v-list-item-title>Reload PHP tasks</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
    
    <v-main>
        <v-container>
            <v-list lines="two">
                <v-list-item v-for="job in filtered_jobs" :key="job.Name" @click="$router.push({ name: 'job', params: { jobid: job.Name }})">
                    <template v-slot:prepend>
                        <v-icon :icon="mdiCog"/>
                    </template>
                    <v-list-item-title>{{ job.Name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ job.Type }} / {{ job.Status }}</v-list-item-subtitle>
                    <alloc-summary :summary="job.SummaryTotal"></alloc-summary>
                </v-list-item>
            </v-list>
        </v-container>
    </v-main>
    <confirm-dialog ref="confirm"/>

</template>

<script setup>
import {
    mdiHome,
    mdiDotsVertical,
    mdiCog,
    mdiMagnify
} from '@mdi/js'
</script>

<script>

import NomadWatcher from './NomadWatcher.js'
import Axios from 'axios'

export default {
    name: 'JobsList',
    data() {
        return {
            dialog_confirm: {
                show: false
            },
            jobs: [],
            watcher_jobs: null,
            filter: ""
        }
    },
    computed: {
        filtered_jobs: function() {
            return this.jobs.filter(job => {
                return job.Type == "service" && (!this.filter || job.Name.toLowerCase().includes(this.filter.toLowerCase()))
            })
        }
    },
    created: function() {
        let that = this

        this.watcher_jobs = new NomadWatcher(this.nomad_url + '/v1/jobs')
        this.watcher_jobs.onUpdate(jobs => {
            that.jobs = jobs
            that.jobs.forEach(job => {
                var stats = {
                    'Complete': 0,
                    'Failed': 0,
                    'Lost': 0,
                    'Queued': 0,
                    'Running': 0,
                    'Starting': 0,
                    'Total': 0
                }
                for (var tg in job.JobSummary.Summary) {
                    var tg_stats = job.JobSummary.Summary[tg]
                    for (var state in tg_stats) {
                        stats[state] += tg_stats[state]
                        stats['Total'] += tg_stats[state]
                    }
                }
                job['SummaryTotal'] = stats
            })
        })
        this.watcher_jobs.watch()
    },
    unmounted() {
        if (this.watcher_jobs) {
            this.watcher_jobs.cancel()
        }
    },
    methods: {
        reloadPHP() {
            this.$refs.confirm.confirm(
                "Restart PHP tasks ?",
                "You are about to restart all PHP tasks. Are you sure you want to do that ?",
                function() {
                    Axios.put(this.consul_url + '/v1/kv/nomad_reload/php', Date.now()).catch(error => {
                        this.addSnack('Error while reloading PHP tasks (' + error + ').', 'error')
                    })
                }
            )
        }
    }
}

</script>
