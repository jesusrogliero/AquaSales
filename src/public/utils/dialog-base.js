'use strict';

export default Vue.component('dialog-base', {

    props: ['active', 'hide'],

    data: function () {
        return {

        };
    },

    template: `
    
    <v-dialog
        transition="dialog-bottom-transition"
        max-width="600"
        v-model="active"
    >
        <template v-slot:default="dialog">
            <v-card v-if="active">

                <v-toolbar color="primary" dark >
                    <slot name="dialog-title"></slot>
                </v-toolbar>

                <v-card-text>
                    <slot name="dialog-content"></slot>
                </v-card-text>

                <v-card-actions class="justify-end">
                    <slot name="dialog-actions"></slot>
                </v-card-actions>

            </v-card>
        </template>
    </v-dialog>
    `
});