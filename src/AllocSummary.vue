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

.alloc-empty {
    background: lightgrey
}


</style>

<template>

<v-container fluid grid-list-xs style="padding: 0">
    <v-layout row justify-space-around>
        <v-flex class="text-center" v-if="wanted">
            <div>Wanted</div><strong>{{ wanted }}</strong>
        </v-flex>
        <v-flex class="text-center" v-for="state in ['Queued', 'Starting', 'Running', 'Complete', 'Failed', 'Lost']" v-bind:key="state" v-if="text">
            <div>{{ state }}</div><strong>{{ summary[state] }}</strong>
        </v-flex>
    </v-layout>
    <v-layout row>
        <v-flex xs12>
            <div v-if="total > 0" v-for="state in ['Queued', 'Starting', 'Running', 'Complete', 'Failed', 'Lost']" v-bind:key="state" class="alloc-state"  v-bind:class="['alloc-state-' + state]" v-bind:style="{'width': (summary[state] / total * 100) + '%'}" v-bind:title="state + ': ' + summary[state]"/>
            <div v-if="total == 0" class="alloc-state alloc-empty" style="width: 100%" title="No allocation"/>
        </v-flex>
    </v-layout>
</v-container>

</template>

<script>

export default {
    name: 'allocSummary',
    props: ['summary', 'wanted', 'text'],
    computed: {
        total: function () {
            return this.summary['Queued'] + this.summary['Starting'] + this.summary['Running'] + this.summary['Complete'] + this.summary['Failed'] + this.summary['Lost']
        }
    }
}

</script>
