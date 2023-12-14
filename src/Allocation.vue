<style>

</style>

<template>

<v-app>
    <v-app-bar color="blue" dark app elevate-on-scroll>
        <v-app-bar-nav-icon>
            <v-tooltip right>
                <template v-slot:activator="{ on }">
                    <v-btn icon @click="$router.push({ name: 'job', params: { jobid: allocation.Job.Name } })" v-on="on">
                        <v-icon>mdi-arrow-left-circle</v-icon>
                    </v-btn>
                </template>
                <span>Back to job</span>
            </v-tooltip>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Allocation {{ allocation.Name }}</v-toolbar-title>
    </v-app-bar>

    <v-main>
        <v-container>
            <v-card class="pa-3">
                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <v-select v-bind:items="tasks" v-model="task" label="Task"></v-select>
                        </v-flex>
                        <v-flex xs12>
                            <v-tabs v-model="active_tab">
                                <v-tab :key="'events'" ripple>Events</v-tab>
                                <v-tab :key="'stdout'" ripple>stdout</v-tab>
                                <v-tab :key="'stderr'" ripple>stderr</v-tab>
                                <v-tab-item :key="'events'">
                                    <v-data-table :headers="events_headers" :items="allocation.TaskStates[task].Events" v-if="allocation.TaskStates" hide-actions>
                                        <template slot="items" slot-scope="props">
                                            <td>{{ props.item.Time | formatNanoTimestamp }}</td>
                                            <td>{{ props.item.Type }}</td>
                                            <td>{{ props.item.DisplayMessage }}</td>
                                        </template>
                                    </v-data-table>
                                </v-tab-item>
                                <v-tab-item :key="'stdout'" lazy>
                                    <task-console :task="task" :allocid="allocid" :type="'stdout'"></task-console>
                                </v-tab-item>
                                <v-tab-item :key="'stderr'" lazy>
                                    <task-console :task="task" :allocid="allocid" :type="'stderr'"></task-console>
                                </v-tab-item>
                            </v-tabs>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-container>
    </v-main>
</v-app>

</template>

<script>

import NomadWatcher from './NomadWatcher.js'

export default {
    name: 'allocation',
    props: ['allocid'],
    data() {
        return {
            watcher_alloc: null,
            allocation: {},
            tasks: [],
            task: null,
            active_tab: 'events',
            events_headers: [{
                text: 'Time',
                value: 'Time',
                align: 'left'
            }, {
                text: 'Type',
                value: 'Type',
                align: 'left'
            }, {
                text: 'Message',
                value: 'Message',
                align: 'left',
                sortable: false
            }]
        }
    },
    created() {
        this.fetchData()
    },
    destroyed() {
        if (this.watcher_alloc) {
            this.watcher_alloc.cancel()
        }
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        fetchData() {
                let that = this
                let allocid = this.allocid

                if (this.watcher_alloc) {
                    this.watcher_alloc.cancel()
                }
                this.watcher_alloc = new NomadWatcher(nomad_url + '/v1/allocation/' + allocid)
                this.watcher_alloc.onUpdate(allocation => {
                    that.tasks = Object.keys(allocation.TaskStates)
                    if (!that.task) {
                        that.task = that.tasks[0]
                    }
                    that.allocation = allocation
                })
                this.watcher_alloc.watch()
            }
    }
}

</script>
