<style>



</style>

<template>

<v-app>
    <v-toolbar class="blue" dark app>
        <v-btn icon @click="$router.push({ name: 'jobs'})">
            <v-icon>home</v-icon>
        </v-btn>
        <v-toolbar-title>Jobs</v-toolbar-title>
    </v-toolbar>

    <main>
        <v-content>
            <v-list two-line>
                <template v-for="(job, index) in jobs">
                    <v-list-tile ripple avatar v-bind:key="job.Name" @click="$router.push({ name: 'job', params: { jobid: job.Name }})">
                        <v-list-tile-avatar>
                            <v-icon v-if="job.Status == 'pending'"> hourglass_empty </v-icon>
                            <v-icon v-if="job.Status == 'running'"> play_arrow </v-icon>
                            <v-icon v-if="job.Status == 'dead'"> stop </v-icon>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ job.Name }}</v-list-tile-title>
                            <v-list-tile-sub-title>Status: {{ job.Status }}</v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            <v-list-tile-action-text>{{ job.Type }}</v-list-tile-action-text>
                        </v-list-tile-action>
                    </v-list-tile>
                </template>
            </v-list>
        </v-content>
    </main>
</v-app>

</template>

<script>

import NomadWatcher from './NomadWatcher.js'

export default {
    name: 'jobs',
    data() {
        return {
            jobs: [],
            watcher_jobs: null
        }
    },
    created: function() {
        let that = this

        this.watcher_jobs = new NomadWatcher(nomad_url + '/v1/jobs')
        this.watcher_jobs.onUpdate(jobs => {
            that.jobs = jobs
        })
        this.watcher_jobs.watch()
    },
    destroyed() {
        if (this.watcher_jobs) {
            this.watcher_jobs.cancel()
        }
    }
}

</script>
