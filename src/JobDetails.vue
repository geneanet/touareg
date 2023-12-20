<style>

</style>

<template>

    <v-app-bar color="blue" scroll-behavior="elevate">
        <v-app-bar-nav-icon>
            <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                    <v-btn icon @click="$router.push({ name: 'jobs'})" v-bind="props">
                        <v-icon :icon="mdiArrowLeftCircle"/>
                    </v-btn>
                </template>
                <span>Back to jobs list</span>
            </v-tooltip>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Job {{ jobdata.Name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field hide-details variant="solo" density="compact" autofocus clearable :prepend-inner-icon="mdiMagnify" placeholder="Filter..." v-model="filter"></v-text-field>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-tooltip location="left" v-if="jobdata.Status == 'running' || jobdata.Status == 'pending'">
            <template v-slot:activator="{ props }">
                <v-btn icon @click="stopJob()" v-bind="props">
                    <v-icon :icon="mdiStop"/>
                </v-btn>
            </template>
            <span>Stop the job</span>
        </v-tooltip>

        <v-tooltip location="left" v-if="jobdata.Status == 'dead'">
            <template v-slot:activator="{ props }">
                <v-btn icon :disabled="!jobdata.Bootstrapable" @click="startJob()" v-bind="props">
                    <v-icon :icon="mdiPlay"/>
                </v-btn>
            </template>
            <span>Start the job</span>
        </v-tooltip>

        <v-tooltip location="left" v-if="jobdata.Reloadable">
            <template v-slot:activator="{ props }">
                <v-btn icon @click="reloadJob()" v-bind="props">
                    <v-icon :icon="mdiAutorenew"/>
                </v-btn>
            </template>
            <span>Reload the job</span>
        </v-tooltip>
    </v-app-bar>

    <v-main>
        <v-container>
            <v-sheet class="mb-5">
                <v-expansion-panels variant="accordion" multiple :model-value="[0]">
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            <strong>Settings</strong>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <div><strong>Type:</strong> {{ jobdata.Type }}</div>
                                        <div><strong>Status:</strong> {{ jobdata.Status }}</div>
                                    </v-col>
                                    <v-col>
                                        <div><strong>Region:</strong> {{ jobdata.Region }}</div>
                                        <div><strong>Datacenters:</strong> {{ jobdata.Datacenters ? jobdata.Datacenters.join(', ') : '' }}</div>
                                    </v-col>
                                    <v-col>
                                        <div><strong>Bootstrapable:</strong> {{ jobdata.Bootstrapable ? 'Yes' : 'No' }}</div>
                                        <div><strong>Reloadable:</strong> {{ jobdata.Reloadable ? 'Yes' : 'No' }}</div>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="jobdata.Periodic">
                        <v-expansion-panel-title>
                            <strong>Periodicity</strong>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <div><strong>Enabled:</strong> {{ jobdata.Periodic.Enabled ? 'Yes' : 'No' }}</div>
                                        <div><strong>Prohobit Overlap:</strong> {{ jobdata.Periodic.ProhibitOverride ? 'Yes' : 'No' }}</div>
                                    </v-col>
                                    <v-col>
                                        <div><strong>Type:</strong> {{ jobdata.Periodic.SpecType }}</div>
                                        <div><strong>Spec:</strong> {{ jobdata.Periodic.Spec }}</div>
                                    </v-col>
                                    <v-col>
                                        <div><strong>Time Zone:</strong> {{ jobdata.Periodic.TimeZone }}</div>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            <strong>Allocations Summary</strong>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <alloc-summary :summary="totalSummary" :text="true"></alloc-summary>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            <strong>Constraints</strong>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text v-if="jobdata.Constraints">
                            <div v-for="constraint in jobdata.Constraints" v-bind:key="constraint.LTarget">
                                <strong>{{ constraint.LTarget }}</strong> {{ constraint.Operand }} <strong>{{ constraint.RTarget }}</strong>
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-sheet>

            <v-card v-for="tg in filtered_taskgroups" v-bind:key="tg.Name" class="mb-5">
                <v-toolbar class="bg-blue-lighten-2" light>
                    <v-tooltip location="right">
                        <template v-slot:activator="{ props }">
                            <v-btn icon @click="$router.push({ name: 'taskgroup', params: { jobid: jobid, tgid: tg.Name }})" v-bind="props">
                                <v-icon :icon="mdiInformationOutline"/>
                            </v-btn>
                        </template>
                        <span>Task Group details</span>
                    </v-tooltip>                
                    <v-toolbar-title>Task Group <strong>{{ tg.Name }}</strong></v-toolbar-title>

                    <v-spacer></v-spacer>
                    <v-tooltip location="left">
                        <template v-slot:activator="{ props }">
                            <v-btn icon @click="updateTaskGroupCount(tg.Name, tg.Count + 1)" v-bind="props">
                                <v-icon :icon="mdiPlusCircleOutline"/>
                            </v-btn>
                        </template>
                        <span>Increase wanted allocations</span>
                    </v-tooltip>
                    <v-tooltip location="left">
                        <template v-slot:activator="{ props }">
                            <v-btn icon @click="updateTaskGroupCountProtected(tg.Name, tg.Count - 1)" :disabled="tg.Count == 0" v-bind="props">
                                <v-icon :icon="mdiMinusCircleOutline"/>
                            </v-btn>
                        </template>
                        <span>Decrease wanted allocations</span>
                    </v-tooltip>
                    <v-tooltip location="left" v-if="tg.Count > 0">
                        <template v-slot:activator="{ props }">
                            <v-btn icon :disabled="tg.Count == 0" @click="updateTaskGroupCountProtected(tg.Name, 0)" v-bind="props">
                                <v-icon :icon="mdiStop"/>
                            </v-btn>
                        </template>
                        <span>Stop the task group</span>
                    </v-tooltip>
                    <v-tooltip location="left" v-if="tg.Count == 0">
                        <template v-slot:activator="{ props }">
                            <v-btn icon :disabled="tg.DefaultCount == 0" @click="updateTaskGroupCount(tg.Name, tg.DefaultCount)" v-bind="props">
                                <v-icon :icon="mdiPlay"/>
                            </v-btn>
                        </template>
                        <span>Stop the task group</span>
                    </v-tooltip>
                    <v-tooltip location="left" v-if="tg.Reloadable">
                        <template v-slot:activator="{ props }">
                            <v-btn icon @click="reloadTaskGroup(tg.Name)" :disabled="tg.Name in allocdata ? allocdata[tg.Name].Summary['running'] == 0 : true" v-bind="props">
                                <v-icon :icon="mdiAutorenew"/>
                            </v-btn>
                        </template>
                        <span>Reload the task group</span>
                    </v-tooltip>
                </v-toolbar>
                <v-card-text>
                    <alloc-summary :summary="summary[tg.Name]" :wanted="tg.Count" :text="true"></alloc-summary>
                </v-card-text>
                <v-list lines="two" v-if="tg.Name in allocdata">
                    <v-list-item v-for="allocation in allocdata[tg.Name].Allocations" v-bind:key="allocation.ID" @click.stop="$router.push({ name: 'allocation', params: { allocid: allocation.ID }})">
                        <template v-slot:prepend>
                            <v-icon :icon="statuses[allocation.ClientStatus].icon"/>
                        </template>
                       
                        <v-list-item-title>{{ allocation.Name }}</v-list-item-title>
                        <v-list-item-subtitle>Status: {{ allocation.ClientStatus }} on {{ getNodeNameFromId(allocation.NodeID) }}</v-list-item-subtitle>
                        <v-list-item-subtitle>Created {{ $filters.formatNanoTimestampRelative(allocation.CreateTime) }} - Last event : {{ allocation.LastEvent.Type }} ({{ $filters.formatNanoTimestampRelative(allocation.LastEvent.Time) }})</v-list-item-subtitle>
                        
                        <template v-slot:append>
                            <v-tooltip location="left">
                                <template v-slot:activator="{ props }">
                                    <v-btn variant="flat" icon v-if="allocation.ClientStatus == 'running' && tg.Reloadable" @click.stop="reloadAllocation(allocation.Name)" v-bind="props">
                                        <v-icon :icon="mdiAutorenew"/>
                                    </v-btn>
                                </template>
                                <span>Reload the allocation</span>
                            </v-tooltip>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-container>
    </v-main>
    <v-snackbar v-for="(snack, index) in snacks" v-bind:key="index" v-model="snack.visible" :timeout="snack.timeout" :success="snack.context === 'success'" :info="snack.context === 'info'" :warning="snack.context === 'warning'" :error="snack.context === 'error'">
        {{ snack.message }}
        <v-btn variant="flat" @click="snack.visible = false">Close</v-btn>
    </v-snackbar>
    <confirm-dialog ref="confirm"/> 

</template>

<script setup>
import {
    mdiArrowLeftCircle,
    mdiStop,
    mdiPlay,
    mdiAutorenew,
    mdiInformationOutline,
    mdiPlusCircleOutline,
    mdiMinusCircleOutline,
    mdiTimerSand,
    mdiCheck,
    mdiAlertCircleOutline,
    mdiHelpCircleOutline,
    mdiMagnify
} from '@mdi/js'
</script>

<script>

import NomadWatcher from './NomadWatcher.js'
import Axios from 'axios'

export default {
    name: 'JobDetails',
    props: ['jobid'],
    data() {
        return {
            filter: "",
            dialog_confirm: {
                show: false
            },
            snacks: [],
            nodes: {},
            jobdata: {},
            allocdata: [],
            summary: {},
            statuses: {
                pending: {
                    title: 'Pending',
                    icon: mdiTimerSand
                },
                running: {
                    title: 'Running',
                    icon: mdiPlay
                },
                complete: {
                    title: 'Complete',
                    icon: mdiCheck
                },
                failed: {
                    title: 'Failed',
                    icon: mdiAlertCircleOutline
                },
                lost: {
                    title: 'Lost',
                    icon: mdiHelpCircleOutline
                }
            },
            watcher_nodes: null,
            watcher_job: null,
            watcher_allocs: null,
            watcher_summary: null
        }
    },
    created() {
        let that = this

        this.watcher_nodes = new NomadWatcher(this.nomad_url + '/v1/nodes')
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
    unmounted() {
        if (this.watcher_job) {
            this.watcher_job.cancel()
        }
        if (this.watcher_nodes) {
            this.watcher_nodes.cancel()
        }
        if (this.watcher_allocs) {
            this.watcher_allocs.cancel()
        }
        if (this.watcher_summary) {
            this.watcher_summary.cancel()
        }
    },
    watch: {
        '$route': 'fetchData'
    },
    computed: {
        totalSummary: function () {
            let stats = {
                    'Complete': 0,
                    'Failed': 0,
                    'Lost': 0,
                    'Queued': 0,
                    'Running': 0,
                    'Starting': 0                
            }
            for (let tg in this.summary) {
                let tg_stats = this.summary[tg]
                for (let state in tg_stats) {
                    stats[state] += tg_stats[state]
                }
            }
            return stats
        },
        filtered_taskgroups: function () {
            if (this.jobdata.TaskGroups) {
                return this.jobdata.TaskGroups.filter(tg => {
                    return (!this.filter || tg.Name.toLowerCase().includes(this.filter.toLowerCase()))
                })
            } else {
                return []
            }
        }
    },
    methods: {
        fetchData() {
            let that = this
            let jobid = this.jobid

            if (this.watcher_job) {
                this.watcher_job.cancel()
            }
            this.watcher_job = new NomadWatcher(this.nomad_url + '/v1/job/' + jobid)
            this.watcher_job.onUpdate(jobdata => {
                console.log(jobdata)
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
                        if (task.Templates) {
                            task.Templates.forEach(tpl => {
                                if (tpl.DestPath == 'local/reload_token') {
                                    taskgroup.Reloadable = true
                                    jobdata.Reloadable = true
                                    }
                            })
                        }
                    })
                })
                that.jobdata = jobdata
            })
            this.watcher_job.watch()

            if (this.watcher_allocs) {
                this.watcher_allocs.cancel()
            }
            this.watcher_allocs = new NomadWatcher(this.nomad_url + '/v1/job/' + jobid + '/allocations')
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

            if (this.watcher_summary) {
                this.watcher_summary.cancel()
            }
            this.watcher_summary = new NomadWatcher(this.nomad_url + '/v1/job/' + jobid + '/summary')
            this.watcher_summary.onUpdate(summary => {
                that.summary = summary.Summary
            })
            this.watcher_summary.watch()
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
            let jobid = this.jobid

            if (count < 0 && count != 'default') {
                count = 0
            }

            Axios.get(this.nomad_url + '/v1/job/' + jobid).then(request => {
                if (request.status == 200) {
                    let jobdata = request.data

                    jobdata.TaskGroups.forEach(taskgroup => {
                        if (taskgroup.Name == tg || tg == '') {
                            if (count == 'default') {
                                taskgroup.Count = Number(taskgroup.Meta.default_count)
                            } else {
                                taskgroup.Count = count
                            }
                        }
                    })

                    Axios.post(this.nomad_url + '/v1/job/' + jobid, {
                        job: jobdata
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
                    that.updateTaskGroupCount('', 0)
                }
            )
        },
        startJob() {
            this.updateTaskGroupCount('', 'default')
        },
        reloadJob() {
            let jobid = this.jobid
            Axios.put(this.consul_url + '/v1/kv/nomad_reload/job/' + jobid, Date.now()).catch(error => {
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
            Axios.put(this.consul_url + '/v1/kv/nomad_reload/allocation/' + allocationName, Date.now()).catch(error => {
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

        },
        getNodeNameFromId(id) {
            if (this.nodes[id]) {
                return this.nodes[id].Name
            } else {
                return "<unknown>"
            }
        }
    }
}

</script>
