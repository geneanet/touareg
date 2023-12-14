<style>



</style>

<template>

<v-app>
    <v-app-bar color="blue" dark app elevate-on-scroll>
        <v-app-bar-nav-icon>
            <v-tooltip right>
                <template v-slot:activator="{ on }">
                    <v-btn icon @click="$router.push({ name: 'job', params: { jobid: jobdata.Name } })" v-on="on">
                        <v-icon>mdi-arrow-left-circle</v-icon>
                    </v-btn>
                </template>
                <span>Back to job</span>
            </v-tooltip>
        </v-app-bar-nav-icon>
        <v-toolbar-title>Task Group {{ jobdata.Name }}.{{ tgid }}</v-toolbar-title>
    </v-app-bar>

    <v-main>
        <v-container>
            <v-sheet class="mb-3">
                <v-expansion-panels accordion multiple :value="[0]">
                    <v-expansion-panel :value="true">
                        <v-expansion-panel-header><strong>Main settings</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div><strong>Name:</strong> {{ tgdata.Name }}</div>
                            <div><strong>Count:</strong> {{ tgdata.Count }}</div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="tgdata.Constraints && tgdata.Constraints.length > 0">
                        <v-expansion-panel-header><strong>Constraints</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="constraint in tgdata.Constraints" v-bind:key="constraint.LTarget">
                                <strong>{{ constraint.LTarget }}</strong> {{ constraint.Operand }} <strong>{{ constraint.RTarget }}</strong>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="tgdata.Meta">
                        <v-expansion-panel-header><strong>Metadata</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="value, key in tgdata.Meta" v-bind:key="key">
                                <strong>{{ key }}:</strong> {{ value }}
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="tgdata.EphemeralDisk">
                        <v-expansion-panel-header><strong>Ephemeral Disk</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="value, key in tgdata.EphemeralDisk" v-bind:key="key">
                                <strong>{{ key }}:</strong> {{ value }}
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="tgdata.RestartPolicy">
                        <v-expansion-panel-header><strong>Restart Policy</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-if="tgdata.RestartPolicy.Mode == 'delay'">In case of failure, attempt maximum <strong>{{ tgdata.RestartPolicy.Attempts }}</strong> restarts per <strong>{{ tgdata.RestartPolicy.Interval / 1000000000 }}s</strong>, with a <strong>{{ tgdata.RestartPolicy.Delay / 1000000000 }}s</strong> delay.</div>
                            <div v-if="tgdata.RestartPolicy.Mode == 'fail'">Do not restart in case of failure.</div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-sheet>

            <v-card class="mb-3" v-for="task in tgdata.Tasks" v-bind:key="task.Name">
                <v-app-bar class="blue lighten-2" light>
                    <v-icon>mdi-wrench</v-icon>
                    <v-toolbar-title>Task <strong>{{ task.Name }}</strong></v-toolbar-title>
                </v-app-bar>
                <v-expansion-panels accordion multiple :value="[0,1]">
                    <v-expansion-panel>
                        <v-expansion-panel-header><strong>Main settings</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div><strong>driver:</strong> {{ task.Driver}}</div>
                            <div><strong>kill timeout:</strong> {{ task.KillTimeout / 1000000000 }}s</div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header><strong>Driver Configuration</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="value, key in task.Config" v-bind:key="key">
                                <strong>{{ key }}:</strong> {{ value }}
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="task.Constraints && task.Constraints.length > 0">
                        <v-expansion-panel-header><strong>Constraints</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="constraint in task.Constraints" v-bind:key="constraint.LTarget">
                                <strong>{{ constraint.LTarget }}</strong> {{ constraint.Operand }} <strong>{{ constraint.RTarget }}</strong>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="task.Meta">
                        <v-expansion-panel-header><strong>Metadata</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="value, key in task.Meta" v-bind:key="key">
                                <strong>{{ key }}:</strong> {{ value }}
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="task.Env">
                        <v-expansion-panel-header><strong>Environment Variables</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="value, key in task.Env" v-bind:key="key">
                                <strong>{{ key }}:</strong> {{ value }}
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="task.LogConfig">
                        <v-expansion-panel-header><strong>Log Configuration</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Keep maximum <strong>{{ task.LogConfig.MaxFiles }}</strong> files of <strong>{{ task.LogConfig.MaxFileSizeMB }}MB</strong> each.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="task.Resources">
                        <v-expansion-panel-header><strong>Reserved Resources</strong></v-expansion-panel-header>
                        <v-expansion-panel-content>
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
                                    <li v-for="port in task.Resources.Networks[0].ReservedPorts" :key="port.Label">{{ port.Value }} ({{ port.Label }})</li>
                                </ul>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card>

        </v-container>
    </v-main>


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
