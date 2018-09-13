<style>



</style>

<template>

<v-app>
    <v-toolbar class="blue" dark app>
        <v-btn icon @click="$router.go(-1)">
            <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title>Task Group {{ jobdata.Name }}.{{ tgid }}</v-toolbar-title>
    </v-toolbar>

    <main>
        <v-content>
            <v-container fluid>
                <v-layout row wrap>
                    <v-flex xs12 class="mb-3">
                        <v-expansion-panel expand>
                            <v-expansion-panel-content :value="true">
                                <div slot="header"><strong>Main settings</strong></div>
                                <v-card>
                                    <v-card-text class="grey lighten-4">
                                        <div><strong>Name:</strong> {{ tgdata.Name }}</div>
                                        <div><strong>Count:</strong> {{ tgdata.Count }}</div>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                            <v-expansion-panel-content v-if="tgdata.Constraints && tgdata.Constraints.length > 0">
                                <div slot="header"><strong>Constraints</strong></div>
                                <v-card>
                                    <v-card-text class="grey lighten-4">
                                        <div v-for="(constraint, index) in tgdata.Constraints" v-bind:key="constraint.LTarget">
                                            <strong>{{ constraint.LTarget }}</strong> {{ constraint.Operand }} <strong>{{ constraint.RTarget }}</strong>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                            <v-expansion-panel-content v-if="tgdata.Meta">
                                <div slot="header"><strong>Metadata</strong></div>
                                <v-card>
                                    <v-card-text class="grey lighten-4">
                                        <div v-for="(value, key, index) in tgdata.Meta" v-bind:key="key">
                                            <strong>{{ key }}:</strong> {{ value }}</strong>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                            <v-expansion-panel-content v-if="tgdata.EphemeralDisk">
                                <div slot="header"><strong>Ephemeral Disk</strong></div>
                                <v-card>
                                    <v-card-text class="grey lighten-4">
                                        <div v-for="(value, key, index) in tgdata.EphemeralDisk" v-bind:key="key">
                                            <strong>{{ key }}:</strong> {{ value }}</strong>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                            <v-expansion-panel-content v-if="tgdata.RestartPolicy">
                                <div slot="header"><strong>Restart Policy</strong></div>
                                <v-card>
                                    <v-card-text class="grey lighten-4" v-if="tgdata.RestartPolicy.Mode == 'delay'">In case of failure, attempt maximum <strong>{{ tgdata.RestartPolicy.Attempts }}</strong> restarts per <strong>{{ tgdata.RestartPolicy.Interval / 1000000000 }}s</strong>, with a <strong>{{ tgdata.RestartPolicy.Delay / 1000000000 }}s</strong> delay.</v-card-text>
                                    <v-card-text class="grey lighten-4" v-if="tgdata.RestartPolicy.Mode == 'fail'">Do not restart in case of failure.</v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-flex>
                    <v-flex xs12 class="mb-3" v-for="(task, index) in tgdata.Tasks" v-bind:key="task.Name">
                        <v-card>
                            <v-toolbar class="blue lighten-2" light>
                                <v-icon>build</v-icon>
                                <v-toolbar-title>Task <strong>{{ task.Name }}</strong></v-toolbar-title>
                            </v-toolbar>
                            <v-expansion-panel expand>
                                <v-expansion-panel-content :value="true">
                                    <div slot="header"><strong>Main settings</strong></div>
                                    <v-card>
                                        <v-card-text class="grey lighten-4">
                                            <div><strong>driver:</strong> {{ task.Driver}}</div>
                                            <div><strong>kill timeout:</strong> {{ task.KillTimeout / 1000000000 }}s</div>
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                                <v-expansion-panel-content :value="true">
                                    <div slot="header"><strong>Driver Configuration</strong></div>
                                    <v-card-text class="grey lighten-4">
                                        <div v-for="(value, key, index) in task.Config" v-bind:key="key">
                                            <strong>{{ key }}:</strong> {{ value }}
                                        </div>
                                    </v-card-text>
                                </v-expansion-panel-content>
                                <v-expansion-panel-content v-if="task.Constraints && task.Constraints.length > 0">
                                    <div slot="header"><strong>Constraints</strong></div>
                                    <v-card>
                                        <v-card-text class="grey lighten-4">
                                            <div v-for="(constraint, index) in task.Constraints" v-bind:key="constraint.LTarget">
                                                <strong>{{ constraint.LTarget }}</strong> {{ constraint.Operand }} <strong>{{ constraint.RTarget }}</strong>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                                <v-expansion-panel-content v-if="task.Meta">
                                    <div slot="header"><strong>Metadata</strong></div>
                                    <v-card>
                                        <v-card-text class="grey lighten-4">
                                            <div v-for="(value, key, index) in task.Meta" v-bind:key="key">
                                                <strong>{{ key }}:</strong> {{ value }}</strong>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                                <v-expansion-panel-content v-if="task.Env">
                                    <div slot="header"><strong>Environment Variables</strong></div>
                                    <v-card>
                                        <v-card-text class="grey lighten-4">
                                            <div v-for="(value, key, index) in task.Env" v-bind:key="key">
                                                <strong>{{ key }}:</strong> {{ value }}</strong>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                                <v-expansion-panel-content v-if="task.LogConfig">
                                    <div slot="header"><strong>Log Configuration</strong></div>
                                    <v-card>
                                        <v-card-text class="grey lighten-4">
                                            Keep maximum <strong>{{ task.LogConfig.MaxFiles }}</strong> files of <strong>{{ task.LogConfig.MaxFileSizeMB }}MB</strong> each.
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                                <v-expansion-panel-content v-if="task.Resources">
                                    <div slot="header"><strong>Reserved Resources</strong></div>
                                    <v-card>
                                        <v-card-text class="grey lighten-4">
                                            <div v-if="task.Resources.CPU > 0"><strong>CPU:</strong> {{ task.Resources.CPU }} MHz</div>
                                            <div v-if="task.Resources.DiskMB > 0"><strong>Disk:</strong> {{ task.Resources.DiskMB }} MB</div>
                                            <div v-if="task.Resources.IOPS > 0"><strong>IOPS:</strong> {{ task.Resources.IOPS }}</div>
                                            <div v-if="task.Resources.MemoryMB > 0"><strong>Memory:</strong> {{ task.Resources.MemoryMB }} MB</div>
                                            <div v-if="task.Resources.Networks && task.Resources.Networks.length > 0 && task.Resources.Networks[0].MBits > 0">
                                                <strong>Network:</strong> {{ task.Resources.Networks[0].MBits }} Mbps
                                            </div>
                                            <div v-if="task.Resources.Networks && task.Resources.Networks.length > 0 && task.Resources.Networks[0].ReservedPorts && task.Resources.Networks[0].ReservedPorts.length > 0">
                                                <strong>Reserved ports:</strong>
                                                <ul>
                                                    <li v-for="(port, index) in task.Resources.Networks[0].ReservedPorts" :key="port.Label">{{ port.Value }} ({{ port.Label }})</li>
                                                </ul>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
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
    name: 'taskgroup',
    props: ['jobid', 'tgid'],
    data() {
        return {
            jobdata: {},
            tgdata: {},
            watcher_job: null
        }
    },
    created() {
        let that = this
        this.fetchData()
    },
    destroyed() {
        if (this.watcher_job) {
            this.watcher_job.cancel()
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
                jobdata.TaskGroups.forEach(taskgroup => {
                    if (taskgroup.Name == that.tgid) {
                        that.tgdata = taskgroup
                    }
                })
                that.jobdata = jobdata
            })
            this.watcher_job.watch()
        }
    }
}

</script>
