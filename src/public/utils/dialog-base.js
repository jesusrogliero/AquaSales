'use strict';

export default Vue.component('dialog-base', {

    props: ["active", "hide", "max-width"],
    
    data: function(){
        return {
            maxWindow: 640
        }
    },

    created: function(){
        if( this.maxWidth > 0 )
            this.maxWindow = this.maxWidth;
    },

    watch: {
        maxWidth: function(value){
            if(  value > 0 )
                this.maxWindow = value;
        }
    },

    template: `
    
    <v-dialog
        transition="dialog-bottom-transition"
        :max-width = "maxWindow"
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