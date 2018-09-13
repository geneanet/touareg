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

.joblist-alloc {
    display: inline-block;
    height: 1em;
}

.joblist-alloc-Complete {
    background: #46cc99
}

.joblist-alloc-Running {
    background: #96e2c5
}

.joblist-alloc-Failed {
    background: #c75d58
}

.joblist-alloc-Queued {
    background: #d3d3d3
}

.joblist-alloc-Starting {
    background: #e4ceb8
}

.joblist-alloc-Lost {
    background: gray
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
                <v-container fluid grid-list-lg>
                    <v-layout row wrap>
                        <template v-for="(job, index) in filtered_jobs">
                            <v-flex v-bind:key="job.Name" xs12 sm6 md4 lg3>   
                                <v-card>
                                    <v-card-title primary-title>
                                        <div>
                                            <div class="headline">
                                                {{ job.Name }}
                                            </div>
                                            <div class="grey--text">
                                                Status: {{ job.Status }}
                                            </div>
                                            <div class="grey--text">Type: {{ job.Type }}</div>
                                        </div>
                                    </v-card-title>
                                    <v-container fluid grid-list-xs style="padding: 0 1em" v-if="job.SummaryTotal.Total > 0">
                                        <v-layout row>
                                            <v-flex xs12>
                                                <div v-for="state in ['Queued', 'Starting', 'Running', 'Complete', 'Failed', 'Lost']" v-bind:key="state" class="joblist-alloc"  v-bind:class="['joblist-alloc-' + state]" v-bind:style="{'width': (job.SummaryTotal[state] / job.SummaryTotal.Total * 100) + '%'}" v-bind:title="state + ': ' + job.SummaryTotal[state]"/>
                                            </v-flex>
                                        </v-layout>
                                    </v-container>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn flat @click="$router.push({ name: 'job', params: { jobid: job.Name }})">
                                            <v-icon>search</v-icon>
                                            <span>Details</span>
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-flex>
                        </template>
                    </v-layout>
                </v-container>
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
    }
}

</script>
