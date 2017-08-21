<style>

.console {
    max-height: 30em;
    overflow-y: scroll;
}

.consoledata {
    white-space: pre-line;
}

</style>

<template>

<v-card flat>
    <v-card-text ref="console" class="console" @scroll="scrolled">
        <div class="consoledata">{{data}}</div>
        <v-progress-circular indeterminate v-bind:size="16" class="primary--text"></v-progress-circular>
    </v-card-text>
</v-card>

</template>

<script>

import Oboe from 'oboe'

export default {
    name: 'console',
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
    destroyed() {
        if (this.oboe) {
            this.oboe.abort()
        }
    },
    updated() {
        if (this.follow) {
            let console = this.$refs.console;
            console.scrollTop = console.scrollHeight;
        }
    },
    watch: {
        'stream_url': 'setupStream',
        'allocid': 'fetchNode'
    },
    methods: {
        setupStream() {
            let that = this
            if (this.stream_url) {
                this.oboe = Oboe(this.stream_url)
                this.oboe.node('!', (data) => {
                    if (data.Data) {
                        that.data = that.data + window.atob(data.Data)
                    }
                })
            }
        },
        scrolled() {
            let taskconsole = this.$refs.console;
            this.follow = taskconsole.scrollTop > taskconsole.scrollHeight - taskconsole.clientHeight - 10;
        },
        fetchNode() {
            let that = this
            Oboe(nomad_url + '/v1/allocation/' + this.allocid).done((alloc) => {
                Oboe(nomad_url + '/v1/node/' + alloc.NodeID).done((node) => {
                    that.node = node.HTTPAddr.split(':')[0]
                })
            })
        }
    },
    computed: {
        stream_url() {
            if (this.allocid && this.task && this.node && this.type) {
                return nomad_node_url.replace('{node}', this.node) + '/v1/client/fs/logs/' + this.allocid + '?task=' + this.task + '&follow=true&type=' + this.type + '&origin=end&offset=20480'
            } else {
                return null
            }
        }
    }
}

</script>
