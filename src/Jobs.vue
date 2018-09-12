<style>

.joblist-leave-active {
  position: absolute;
  width: 100%;
}
.joblist-enter-active, .joblist-leave-active {
  transition: all .3s;
}
.joblist-enter, .joblist-leave-to {
  opacity: 0;
}
.joblist-move {
  transition: all .3s;
}


</style>

<template>

<v-app>
    <v-toolbar class="blue" dark app>
        <v-btn icon @click="$router.push({ name: 'jobs'})">
            <v-icon>home</v-icon>
        </v-btn>
        <v-toolbar-title>Jobs</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field style="max-width: 30em" clearable light autofocus prepend-inner-icon="search" solo label="Filter..." v-model="filter"></v-text-field>
    </v-toolbar>

    <main>
        <v-content>
            <v-list two-line>
                <transition-group name="joblist" tag="div">
                    <template v-for="(job, index) in filtered_jobs">
                        <v-list-tile class="joblist" ripple avatar v-bind:key="job.Name" @click="$router.push({ name: 'job', params: { jobid: job.Name }})">
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
                </transition-group>
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
            watcher_jobs: null,
            filter: ""
        }
    },
    computed: {
        filtered_jobs: function() {
            return this.jobs.filter(job => {
                    return !this.filter || job.Name.toLowerCase().includes(this.filter.toLowerCase())
            })
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
