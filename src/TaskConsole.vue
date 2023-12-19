<style>

.console {
    max-height: 45em;
    overflow-y: scroll;
}

.consoledata {
    white-space: pre-line;
    font-family: monospace;
}

</style>

<template>

<v-sheet full-width class="console" ref="console" @scroll="scrolled">
    <div class="consoledata">{{data}}</div>
    <v-progress-linear ref="progress" indeterminate v-bind:size="16" class="text-primary"/>
</v-sheet>

</template>

<script>

import Oboe from 'oboe'

export default {
    name: 'TaskConsole',
    props: [
        'allocid',
        'task',
        'type'
    ],
    data() {
        return {
            node: null,
            data: '',
            follow: true
        }
    },
    created() {
        this.fetchNode()
        this.setupStream()
    },
    unmounted() {
        if (this.oboe) {
            this.oboe.abort()
        }
    },
    watch: {
        'stream_url': 'setupStream',
        'allocid': 'fetchNode',
        'data': 'dataUpdated'
    },
    methods: {
        scrolled() {
            let taskconsole = this.$refs.console.$el;
            this.follow = taskconsole.scrollTop > taskconsole.scrollHeight - taskconsole.clientHeight - 10;
        },
        dataUpdated() {
            this.$nextTick(function () {
                if (this.follow) {
                    var taskconsole = this.$refs.console.$el
                    taskconsole.scrollTo({
                        top: taskconsole.scrollHeight
                    })
                }
            })
        },
        setupStream() {
            let that = this
            if (this.stream_url) {
                this.oboe = Oboe(this.stream_url)
                this.oboe.node('!', (data) => {
                    if (data.Data) {
                        that.data = that.data + window.atob(data.Data)
                        if (that.data.length > 100*1024) {
                            that.data = that.data.substr(that.data.length - 100*1024)
                        }
                    }
                })
            }
        },
        fetchNode() {
            let that = this
            Oboe(this.nomad_url + '/v1/allocation/' + this.allocid).done((alloc) => {
                Oboe(this.nomad_url + '/v1/node/' + alloc.NodeID).done((node) => {
                    that.node = node.HTTPAddr.split(':')[0]
                })
            })
        }
    },
    computed: {
        stream_url() {
            if (this.allocid && this.task && this.node && this.type) {
                return this.nomad_node_url.replace('{node}', this.node) + '/v1/client/fs/logs/' + this.allocid + '?task=' + this.task + '&follow=true&type=' + this.type + '&origin=end&offset=20480'
            } else {
                return null
            }
        }
    }
}

</script>
