<style>



</style>

<template>

<v-dialog v-model="show" persistent width="50%">
    <v-card>
        <v-card-title class="text-h5">
            <div v-html="title"></div>
        </v-card-title>
        <v-card-text>
            <div v-html="message"></div>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" @click="show = false; callback()">Yes</v-btn>
            <v-btn color="green" @click="show = false;">No</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>

</template>

<script>

export default {
    name: 'confirmDialog',
    props: [''],
    data() {
        return {
            title: '',
            message: '',
            show: false,
            callback: null
        }
    },
    methods: {
        confirm(title, message, callback) {
            this.title = title
            this.message = message
            this.callback = callback
            this.show = true
        }
    }
}

</script>
