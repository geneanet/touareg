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

<v-container class="pa-0">
    <v-row v-if="text" dense>
        <v-col class="text-center" v-if="wanted">
            <div>Wanted</div><strong>{{ wanted }}</strong>
        </v-col>
        <v-col class="text-center" v-for="state in ['Queued', 'Starting', 'Running', 'Complete', 'Failed', 'Lost']" v-bind:key="state">
            <div>{{ state }}</div><strong>{{ summary_safe[state] }}</strong>
        </v-col>
    </v-row>
    <v-row dense>
        <v-col v-if="total > 0">
            <div v-for="state in ['Queued', 'Starting', 'Running', 'Complete', 'Failed', 'Lost']" v-bind:key="state" class="alloc-state"  v-bind:class="['alloc-state-' + state]" v-bind:style="{'width': (summary_safe[state] / total * 100) + '%'}" v-bind:title="state + ': ' + summary_safe[state]"/>
        </v-col>
        <v-col v-if="total == 0">
            <div class="alloc-state alloc-empty" style="width: 100%" title="No allocation"/>
        </v-col>
    </v-row>
</v-container>

</template>

<script>

export default {
    name: 'allocSummary',
    props: ['summary', 'wanted', 'text'],
    computed: {
        total: function () {
            if (this.summary) {
                return this.summary['Queued'] + this.summary['Starting'] + this.summary['Running'] + this.summary['Complete'] + this.summary['Failed'] + this.summary['Lost']
            } else {
                return 0
            }
        },
        summary_safe: function () {
            if (this.summary) {
                return this.summary
            } else {
                return {
                    'Queued': 0,
                    'Starting': 0,
                    'Running': 0,
                    'Complete': 0,
                    'Failed': 0,
                    'Lost': 0,
                }
            }
        }
    }
}

</script>
