<style>

</style>

<template>

    <v-app-bar color="blue" scroll-behavior="elevate">
        <v-app-bar-nav-icon>
            <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                    <v-btn icon @click="$router.push({ name: 'job', params: { jobid: allocation.Job.Name } })" v-bind="props">
                        <v-icon :icon="mdiArrowLeftCircle"/>
                    </v-btn>
                </template>
                <span>Back to job</span>
            </v-tooltip>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Allocation {{ allocation.Name }}</v-toolbar-title>
    </v-app-bar>

    <v-main>
        <v-container>
            <v-card>
                <v-select v-bind:items="tasks" v-model="task" label="Task"></v-select>
                <v-tabs v-model="active_tab" bg-color="blue">
                    <v-tab value="events" ripple>Events</v-tab>
                    <v-tab value="stdout" ripple>Stdout</v-tab>
                    <v-tab value="stderr" ripple>Stderr</v-tab>
                </v-tabs>
                <v-card-text>
                    <v-window v-model="active_tab">
                        <v-window-item value="events">
                            <v-data-table :headers="events_headers" :items="allocation.TaskStates[task].Events" :sort-by="[{ key: 'Time', order: 'desc'}]" v-if="allocation.TaskStates">
                                <template v-slot:item.Time="{ item }">{{ $filters.formatNanoTimestamp(item.Time) }}</template>
                            </v-data-table>
                        </v-window-item>
                        <v-window-item value="stdout" lazy>
                            <task-console :task="task" :allocid="allocid" :type="'stdout'"></task-console>
                        </v-window-item>
                        <v-window-item value="stderr" lazy>
                            <task-console :task="task" :allocid="allocid" :type="'stderr'"></task-console>
                        </v-window-item>
                    </v-window>
                </v-card-text>
           </v-card>
        </v-container>
    </v-main>

</template>

<script setup>
import {
    mdiArrowLeftCircle
} from '@mdi/js'
</script>

<script>

import NomadWatcher from './NomadWatcher.js'

export default {
    name: 'AllocationDetails',
    props: ['allocid'],
    data() {
        return {
            watcher_alloc: null,
            allocation: {},
            tasks: [],
            task: null,
            active_tab: 'events',
            events_headers: [
                {
                    title: 'Time',
                    value: 'Time',
                    align: 'left',
                    sortable: true
                }, {
                    title: 'Type',
                    value: 'Type',
                    align: 'left',
                    sortable: true
                }, {
                    title: 'Message',
                    value: 'Message',
                    align: 'left',
                }
            ]
        }
    },
    created() {
        this.fetchData()
    },
    unmounted() {
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
                this.watcher_alloc = new NomadWatcher(this.nomad_url + '/v1/allocation/' + allocid)
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
