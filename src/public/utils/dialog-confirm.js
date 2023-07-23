'use strict';

export default Vue.component('dialog-confirm', {

    props: ["active", "confirm", "cancel"],

    template: `
    
    <v-dialog
        persistent 
        v-bind:value="active" 
        min-width="320" 
        max-width="450"
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
                
                <v-btn 
                    v-on:click="confirm(true)" 
                    v-bind:elevation="0" 
                    color="transparent"
                    style="color:#2c823c !important;"
                >
                    <span>Aceptar</span>
                    <v-icon>mdi-check</v-icon>
                </v-btn>
            
                <v-btn
                    v-on:click="cancel(false)"
                    v-bind:elevation="0"
                    color="transparent"
                    style="color: #f44336 !important;"
                >
                    <span>Cancelar</span>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                </v-card-actions>

            </v-card>
        </template>
    </v-dialog>
    `
});