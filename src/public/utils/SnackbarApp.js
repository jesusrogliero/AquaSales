'use strict';

export default Vue.component('snackbar-app',{
    props: ["text", "icon", "color"],

    data: function(){
        return {
            snackbar: false,
        };
    },

    watch: {
        text: function(value){
            this.snackbar = true;
        }
    },

    template: `
        <v-snackbar 
            v-model = "snackbar"  
            :color="color"
            timeout = "2500"
            :top = "false"
            :vertical="'vertical'"
        >
            
            <div>
                <v-icon v-if = "icon != null" dark>
                    mdi-{{ icon }}
                </v-icon>
                <span class="text-h6"  style = "margin-left: 5px;">
                    {{ text }}
                </span>
            </div>
        </v-snackbar>
    `
});