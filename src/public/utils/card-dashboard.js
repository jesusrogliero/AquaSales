'use strict';

export default Vue.component('card-dashboard', {

    props: ["title", "bs", "usd", "icon"],

    template: `
        <v-card :loading="loading" color="#ECEFF1">
            <v-card-title>{{title}}</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <h1 class="ml-2">{{bs}} BsS</h1>
                    </v-col>
                    <v-col>
                        <h1 class="ml-2">{{usd}} $</h1>
                    </v-col>

                    <v-spacer></v-spacer>
                    <v-icon size="80" class="mr-2 mt-n9" color="green">{{icon}}</v-icon>
                </v-row>
            </v-card-text>
        </v-card>
    `
});