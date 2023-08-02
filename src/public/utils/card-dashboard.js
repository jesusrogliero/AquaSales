'use strict';

export default Vue.component('card-dashboard', {

    props: ["title", "bs", "usd", 'data', 'symbol', "icon"],

    template: `
        <v-card color="#ECEFF1">
            <v-card-title>{{title}}</v-card-title>
            <v-card-text>
                <v-row v-if="bs != null || usd != null">
                    <v-col cols="12">
                        <h1 class="ml-2">{{bs == null ? 0 : bs }}  BsS</h1>
                    </v-col>
                    <v-col>
                        <h1 class="ml-2">{{usd == null ? 0 : usd }}  $</h1>
                    </v-col>

                    <v-spacer></v-spacer>
                    <v-icon size="80" class="mr-2 mt-n9" color="green">{{icon}}</v-icon>
                </v-row>

                <v-row v-else>
                    <h1 class="ml-2">{{data == null ? 0 : data }} {{symbol}}</h1>
                    <v-spacer></v-spacer>
                    <v-icon size="80" class="mr-2 mt-n9" color="green">{{icon}}</v-icon>
                </v-row>

            </v-card-text>
        </v-card>
    `
});