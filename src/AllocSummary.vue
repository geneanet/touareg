<style>

.alloc-state {
    display: inline-block;
    height: 1em;
}

.alloc-state-Complete {
    background: #46cc99
}

.alloc-state-Running {
    background: #96e2c5
}

.alloc-state-Failed {
    background: #c75d58
}

.alloc-state-Queued {
    background: #d3d3d3
}

.alloc-state-Starting {
    background: #e4ceb8
}

.alloc-state-Lost {
    background: gray
}


</style>

<template>

<v-container fluid grid-list-xs style="padding: 0 1em">
    <v-layout row>
        <v-flex xs12>
            <div v-for="state in ['Queued', 'Starting', 'Running', 'Complete', 'Failed', 'Lost']" v-bind:key="state" class="alloc-state"  v-bind:class="['alloc-state-' + state]" v-bind:style="{'width': (summary[state] / total * 100) + '%'}" v-bind:title="state + ': ' + summary[state]"/>
        </v-flex>
    </v-layout>
</v-container>

</template>

<script>

export default {
    name: 'allocSummary',
    props: ['summary'],
    computed: {
        total: function () {
            return this.summary['Queued'] + this.summary['Starting'] + this.summary['Running'] + this.summary['Complete'] + this.summary['Failed'] + this.summary['Lost']
        }
    }
}

</script>
