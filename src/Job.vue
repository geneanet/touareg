<style>



</style>

<template>

<v-app>
    <v-toolbar class="blue" dark app>
        <v-btn icon @click="$router.go(-1)">
            <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title>Job {{ jobdata.Name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip left>
            <v-btn icon v-if="jobdata.Status == 'running' || jobdata.Status == 'pending'" @click="stopJob()" slot="activator">
                <v-icon>stop</v-icon>
            </v-btn>
            <span>Stop the job</span>
        </v-tooltip>
        <v-tooltip left>
            <v-btn icon v-if="jobdata.Status == 'dead'" :disabled="!jobdata.Bootstrapable" @click="startJob()" slot="activator">
                <v-icon>play_arrow</v-icon>
            </v-btn>
            <span>Start the job</span>
        </v-tooltip>
        <v-tooltip left>
            <v-btn icon v-if="jobdata.Reloadable" @click="reloadJob()" :disabled="jobdata.Status != 'running'" slot="activator">
                <v-icon>autorenew</v-icon>
            </v-btn>
            <span>Reload the job</span>
        </v-tooltip left>
    </v-toolbar>

    <main>
        <v-content>
            <v-container fluid>
                <v-layout row wrap>
                    <v-flex xs12 class="mb-3">
                        <v-card>
                            <v-expansion-panel expand class="elevation-0">
                                <v-expansion-panel-content :value="true">
                                    <div slot="header"><strong>Main settings</strong></div>
                                    <v-card>
                                        <v-card-text>
                                            <v-layout row wrap>
                                                <v-flex xs4>
                                                    <div class="grey--text text--darken-1"><strong>Type:</strong> {{ jobdata.Type }}</div>
                                                    <div class="grey--text text--darken-1"><strong>Status:</strong> {{ jobdata.Status }}</div>
                                                </v-flex>
                                                <v-flex xs4>
                                                    <div class="grey--text text--darken-1"><strong>Region:</strong> {{ jobdata.Region }}</div>
                                                    <div class="grey--text text--darken-1"><strong>Datacenters:</strong> {{ jobdata.Datacenters ? jobdata.Datacenters.join(', ') : '' }}</div>
                                                </v-flex>
                                                <v-flex xs4>
                                                    <div class="grey--text text--darken-1"><strong>Bootstrapable:</strong> {{ jobdata.Bootstrapable ? 'Yes' : 'No' }}</div>
                                                    <div class="grey--text text--darken-1"><strong>Reloadable:</strong> {{ jobdata.Reloadable ? 'Yes' : 'No' }}</div>
                                                </v-flex>
                                            </v-layout>
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                                <v-expansion-panel-content v-if="jobdata.Constraints">
                                    <div slot="header"><strong>Constraints</strong></div>
                                    <v-card>
                                        <v-card-text>
                                            <div class="grey--text text--darken-1" v-for="(constraint, index) in jobdata.Constraints" v-bind:key="constraint.LTarget">
                                                <strong>{{ constraint.LTarget }}</strong> {{ constraint.Operand }} <strong>{{ constraint.RTarget }}</strong>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-card>
                    </v-flex>
                    <v-flex xs12 class="mb-3" v-for="(tg, index) in jobdata.TaskGroups" v-bind:key="tg.Name">
                        <v-card>
                            <v-toolbar class="blue lighten-2" light>
                                <v-icon>group_work</v-icon>
                                <v-toolbar-title>Task Group <strong>{{ tg.Name }}</strong></v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-tooltip left>
                                    <v-btn icon @click="updateTaskGroupCount(tg.Name, tg.Count + 1)" slot="activator">
                                        <v-icon>add_circle_outline</v-icon>
                                    </v-btn>
                                    <span>Increase wanted allocations</span>
                                </v-tooltip>
                                <v-tooltip left>
                                    <v-btn icon @click="updateTaskGroupCountProtected(tg.Name, tg.Count - 1)" :disabled="tg.Count == 0" slot="activator">
                                        <v-icon>remove_circle_outline</v-icon>
                                    </v-btn>
                                    <span>Decrease wanted allocations</span>
                                </v-tooltip>
                                <v-tooltip left>
                                    <v-btn icon v-if="tg.Count > 0" :disabled="tg.Count == 0" @click="updateTaskGroupCountProtected(tg.Name, 0)" slot="activator">
                                        <v-icon>stop</v-icon>
                                    </v-btn>
                                    <span>Stop the task group</span>
                                </v-tooltip>
                                <v-tooltip left>
                                    <v-btn icon v-if="tg.Count == 0" :disabled="tg.DefaultCount == 0" @click="updateTaskGroupCount(tg.Name, tg.DefaultCount)" slot="activator">
                                        <v-icon>play_arrow</v-icon>
                                    </v-btn>
                                    <span>Stop the task group</span>
                                </v-tooltip>
                                <v-tooltip left>
                                    <v-btn icon v-if="tg.Reloadable" @click="reloadTaskGroup(tg.Name)" :disabled="tg.Name in allocdata ? allocdata[tg.Name].Summary['running'] == 0 : true" slot="activator">
                                        <v-icon>autorenew</v-icon>
                                    </v-btn>
                                    <span>Reload the task group</span>
                                </v-tooltip>
                            </v-toolbar>
                            <v-card-text>
                                <v-layout row justify-space-around>
                                    <v-flex class="text-xs-center">
                                        <div>Wanted</div><strong>{{ tg.Count }}</strong>
                                    </v-flex>
                                    <v-flex class="text-xs-center" v-for="(status, index) in statuses" v-bind:key="index">
                                        <div>{{ status.title }}</div><strong>{{ tg.Name in allocdata ? allocdata[tg.Name].Summary[index] : 0 }}</strong>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                            <v-toolbar class="blue lighten-4 elevation-1" light dense v-if="tg.Name in allocdata">
                                <v-toolbar-title>Allocations</v-toolbar-title>
                                <v-spacer></v-spacer>

                                <v-menu offset-y :close-on-content-click="false">
                                    <v-tooltip left slot="activator">
                                        <v-btn light icon slot="activator">
                                            <v-icon>filter_list</v-icon>
                                        </v-btn>
                                        <span>Filter allocations</span>
                                    </v-tooltip>
                                    <v-list>
                                        <v-list-tile v-for="(status, index) in statuses" v-bind:key="index" @click="status.filter = !status.filter">
                                            <v-list-tile-action>
                                                <v-switch v-model="status.filter" @click.stop="status.filter = !status.filter"></v-switch>
                                            </v-list-tile-action>
                                            <v-list-tile-title>{{ status.title }}</v-list-tile-title>
                                        </v-list-tile>
                                    </v-list>
                                </v-menu>
                            </v-toolbar>
                            <v-list two-line v-if="tg.Name in allocdata">
                                <template v-for="(allocation, index) in allocdata[tg.Name].Allocations">
                                    <v-list-tile avatar v-bind:key="allocation.ID" v-if="statuses[allocation.ClientStatus].filter" @click.stop="$router.push({ name: 'allocation', params: { allocid: allocation.ID }})">
                                        <v-list-tile-avatar>
                                            <v-icon> {{ statuses[allocation.ClientStatus].icon }} </v-icon>
                                        </v-list-tile-avatar>
                                        <v-list-tile-content>
                                            <v-list-tile-title>{{ allocation.Name }}</v-list-tile-title>
                                            <v-list-tile-sub-title>Status: {{ allocation.ClientStatus }} on {{ nodes[allocation.NodeID].Name }}</v-list-tile-sub-title>
                                            <v-list-tile-sub-title>Created {{ allocation.CreateTime | formatNanoTimestampRelative }} - Last event : {{ allocation.LastEvent.Type }} ({{ allocation.LastEvent.Time | formatNanoTimestampRelative }})</v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-tooltip left>
                                                <v-btn icon v-if="allocation.ClientStatus == 'running' && tg.Reloadable" @click.stop="reloadAllocation(allocation.Name)" slot="activator">
                                                    <v-icon>autorenew</v-icon>
                                                </v-btn>
                                                <span>Reload the allocation</span>
                                            </v-tooltip>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </template>
                            </v-list>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </main>

    <v-snackbar v-for="(snack, index) in snacks" v-bind:key="index" v-model="snack.visible" :timeout="snack.timeout" :success="snack.context === 'success'" :info="snack.context === 'info'" :warning="snack.context === 'warning'" :error="snack.context === 'error'">
        {{ snack.message }}
        <v-btn dark flat @click="snack.visible = false">Close</v-btn>
    </v-snackbar>

    <confirm-dialog ref="confirm"></confirm-dialog>
</v-app>

</template>

<script>

import NomadWatcher from './NomadWatcher.js'
import Axios from 'axios'

export default {
    name: 'job',
    props: ['jobid'],
    data() {
        return {
            dialog_confirm: {
                show: false
            },
            snacks: [],
            nodes: {},
            jobdata: {},
            allocdata: [],
            statuses: {
                pending: {
                    title: 'Pending',
                    filter: true,
                    icon: 'hourglass_empty'
                },
                running: {
                    title: 'Running',
                    filter: true,
                    icon: 'play_arrow'
                },
                complete: {
                    title: 'Complete',
                    filter: true,
                    icon: 'done'
                },
                failed: {
                    title: 'Failed',
                    filter: true,
                    icon: 'error'
                },
                lost: {
                    title: 'Lost',
                    filter: true,
                    icon: 'help_outline'
                }
            },
            watcher_nodes: null,
            watcher_job: null,
            watcher_allocs: null
        }
    },
    created() {
        let that = this

        this.watcher_nodes = new NomadWatcher(nomad_url + '/v1/nodes')
        this.watcher_nodes.onUpdate(data => {
            let nodes = {}
            data.forEach(node => {
                nodes[node.ID] = node
            })

            that.nodes = nodes
        })
        this.watcher_nodes.watch()

        this.fetchData()
    },
    destroyed() {
        if (this.watcher_job) {
            this.watcher_job.cancel()
        }
        if (this.watcher_nodes) {
            this.watcher_nodes.cancel()
        }
        if (this.watcher_allocs) {
            this.watcher_allocs.cancel()
        }
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        fetchData() {
                let that = this
                let jobid = this.jobid

                if (this.watcher_job) {
                    this.watcher_job.cancel()
                }
                this.watcher_job = new NomadWatcher(nomad_url + '/v1/job/' + jobid)
                this.watcher_job.onUpdate(jobdata => {
                    jobdata.Reloadable = false
                    jobdata.Bootstrapable = false
                    jobdata.TaskGroups.forEach(taskgroup => {
                        if (taskgroup.Meta && taskgroup.Meta.default_count) {
                            taskgroup.DefaultCount = Number(taskgroup.Meta.default_count)
                            jobdata.Bootstrapable = true
                        } else {
                            taskgroup.DefaultCount = 0
                        }
                        taskgroup.Reloadable = false
                        taskgroup.Tasks.forEach(task => {
                            task.Templates.forEach(tpl => {
                                if (tpl.DestPath == 'local/reload_token') {
                                    taskgroup.Reloadable = true
                                    jobdata.Reloadable = true
                                }
                            })
                        })
                    })
                    that.jobdata = jobdata
                })
                this.watcher_job.watch()

                if (this.watcher_allocs) {
                    this.watcher_allocs.cancel()
                }
                this.watcher_allocs = new NomadWatcher(nomad_url + '/v1/job/' + jobid + '/allocations')
                this.watcher_allocs.onUpdate(allocations => {
                    let allocdata = {}
                    allocations.forEach(allocation => {
                        if (!allocdata[allocation.TaskGroup]) {
                            allocdata[allocation.TaskGroup] = {
                                Allocations: [],
                                Summary: {
                                    pending: 0,
                                    running: 0,
                                    complete: 0,
                                    failed: 0,
                                    lost: 0,
                                }
                            }
                        }

                        let lastEventTime = 0
                        Object.keys(allocation.TaskStates).forEach(taskName => {
                            allocation.TaskStates[taskName].Events.forEach(event => {
                                if (event.Time > lastEventTime) {
                                    lastEventTime = event.Time
                                    allocation.LastEvent = event
                                }
                            })
                        })

                        allocdata[allocation.TaskGroup].Allocations.push(allocation)
                        allocdata[allocation.TaskGroup].Summary[allocation.ClientStatus] += 1
                    })

                    Object.keys(allocdata).forEach(tgname => {
                        allocdata[tgname].Allocations.sort((a, b) => {
                            return a.CreateTime < b.CreateTime
                        })
                    })

                    that.allocdata = allocdata
                })
                this.watcher_allocs.watch()
            },
            updateTaskGroupCountProtected(tg, count) {
                let that = this

                if (count < 1) {
                    this.$refs.confirm.confirm(
                        "Stop task group <strong>" + tg +"</strong> ?",
                        "You are about to stop the task group <strong>" + tg +"</strong>. Are you sure you want to do that ?",
                        function() {
                            that.updateTaskGroupCount(tg, count)
                        }
                    )
                } else {
                    this.updateTaskGroupCount(tg, count)
                }
            },
            updateTaskGroupCount(tg, count) {
                let that = this
                let jobid = this.jobid

                if (count < 0) {
                    count = 0
                }

                Axios.get(nomad_url + '/v1/job/' + jobid).then(request => {
                    if (request.status == 200) {
                        let jobdata = request.data

                        jobdata.TaskGroups.forEach(taskgroup => {
                            if (taskgroup.Name == tg) {
                                taskgroup.Count = count
                            }
                        })

                        Axios.post(nomad_url + '/v1/job/' + jobid, {
                            job: jobdata
                        }).then(request => {
                            // Everything is OK
                        }).catch(error => {
                            this.addSnack('Error while updating job (' + error + ').', 'error')
                        })
                    } else {
                        this.addSnack('Unexpected return code while fetching job (' + request.status + ').', 'error')
                    }
                }).catch(error => {
                    this.addSnack('Error while fetching job (' + error + ').', 'error')
                })
            },
            stopJob() {
                let that = this

                this.$refs.confirm.confirm(
                    "Stop job <strong>" + this.jobdata.Name + "</strong> ?",
                    "You are about to stop the job <strong>" + this.jobdata.Name +"</strong>. Are you sure you want to do that ?",
                    function() {
                        that.jobdata.TaskGroups.forEach(taskgroup => {
                            that.updateTaskGroupCount(taskgroup.Name, 0)
                        })
                    }
                )
            },
            startJob() {
                let that = this
                this.jobdata.TaskGroups.forEach(taskgroup => {
                    that.updateTaskGroupCount(taskgroup.Name, taskgroup.DefaultCount)
                })
            },
            reloadJob() {
                let jobid = this.jobid
                Axios.put(consul_url + '/v1/kv/nomad_reload/job/' + jobid, Date.now()).catch(error => {
                    this.addSnack('Error while reloading job (' + error + ').', 'error')
                })
            },
            reloadTaskGroup(taskGroupName) {
                let that = this
                this.allocdata[taskGroupName].Allocations.forEach(allocation => {
                    that.reloadAllocation(allocation.Name)
                })
            },
            reloadAllocation(allocationName) {
                Axios.put(consul_url + '/v1/kv/nomad_reload/allocation/' + allocationName, Date.now()).catch(error => {
                    this.addSnack('Error while reloading allocation ' + allocationName + '(' + error + ').', 'error')
                })
            },
            addSnack(message, context = "info", timeout = 0) {
                this.snacks.push({
                    context: context,
                    message: message,
                    timeout: timeout,
                    visible: true
                })

            }
    }
}

</script>
