<style>

</style>

<template>

<v-app>
    <v-app-bar color="blue" dark app elevate-on-scroll>
        <v-app-bar-nav-icon @click="$router.push({ name: 'jobs'})">
            <v-icon>mdi-home</v-icon>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Jobs</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field style="max-width: 60em" hide-details solo clearable light autofocus prepend-inner-icon="mdi-magnify" label="Filter..." v-model="filter"></v-text-field>
        <v-spacer></v-spacer>
        <v-menu bottom left offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn dark icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-more_vert</v-icon>
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
            <v-list two-line>
                <v-list-item-group v-model="selectedItem" color="primary">
                    <v-list-item v-for="job in filtered_jobs" :key="job.Name" @click="$router.push({ name: 'job', params: { jobid: job.Name }})">
                        <v-list-item-avatar>
                            <v-icon class="grey lighten-1" dark>mdi-cog</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>{{ job.Name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ job.Type }} / {{ job.Status }}</v-list-item-subtitle>
                            <alloc-summary :summary="job.SummaryTotal"></alloc-summary>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon>
                                <v-icon>mdi-magnify</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-container>
    </v-main>
    <confirm-dialog ref="confirm"></confirm-dialog>
</v-app>

</template>

<script>

import NomadWatcher from './NomadWatcher.js'
import Axios from 'axios'

export default {
    name: 'jobs',
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

        this.watcher_jobs = new NomadWatcher(nomad_url + '/v1/jobs')
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
    destroyed() {
        if (this.watcher_jobs) {
            this.watcher_jobs.cancel()
        }
    },
    methods: {
        reloadPHP() {
            let that = this

            this.$refs.confirm.confirm(
                "Restart PHP tasks ?",
                "You are about to restart all PHP tasks. Are you sure you want to do that ?",
                function() {
                    Axios.put(consul_url + '/v1/kv/nomad_reload/php', Date.now()).catch(error => {
                        this.addSnack('Error while reloading PHP tasks (' + error + ').', 'error')
                    })
                }
            )
        }
    }
}

</script>
