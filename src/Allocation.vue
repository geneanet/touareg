<style>

</style>

<template>

<v-app>
    <v-toolbar class="blue" dark app>
        <v-btn icon @click="$router.go(-1)">
            <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title>Allocation {{ allocation.Name }}</v-toolbar-title>
    </v-toolbar>

    <main>
        <v-content>
            <v-container fluid>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-card>
                            <v-card-text>
                                <v-layout row wrap>
                                    <v-flex xs12>
                                        <v-select v-bind:items="tasks" v-model="task" label="Task"></v-select>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-tabs dark v-model="active_tab" :scrollable="false" color="blue" class="elevation-1">
                                            <v-tab :key="'events'" ripple>Events</v-tab>
                                            <v-tab :key="'stdout'" ripple>stdout</v-tab>
                                            <v-tab :key="'stderr'" ripple>stderr</v-tab>
                                            <v-tab-item :key="'events'">
                                                <v-data-table :headers="events_headers" :items="allocation.TaskStates[task].Events" v-if="allocation.TaskStates" hide-actions>
                                                    <template slot="items" slot-scope="props">
                                                        <td>{{ props.item.Time | formatNanoTimestamp }}</td>
                                                        <td>{{ props.item.Type }}</td>
                                                        <td>{{ props.item.Message }}</td>
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
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </main>
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
