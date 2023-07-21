'use strict';

export default Vue.component('data-table', {
    props: ["headers", "url", "sale_id", "title", 'add', 'update', 'show', 'destroy', 'details'],

    data: function () {
        return {
            data: [],
            search: '',
            showText: false,
        };
    },

    watch: {
        async url() {
            await this.getData();
        }
    },


    async created() {
        await this.getData();
    },

    methods: {
        async getData() {
            try {
                let data = await execute(this.url, this.sale_id);

                if (data.code == 0) {
                    throw new Error(data.message);
                }
                this.data = data;
            }
            catch (error) {
                alertApp({color:"error", text: error.message, icon: "alert" }); 
            }
        }
    },

    template: `
    <div>

        <v-toolbar elevation="0">
    
            <v-toolbar-title>
                <h3>{{title}}</h3>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <slot name="toolbar"></slot>

            <v-btn 
                icon 
                color="primary"
                v-if="typeof add == 'function'"
                @click="add(null, 'new')"
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>

            <v-btn icon @click="getData">
                <v-icon>mdi-reload</v-icon>
            </v-btn>

            <v-btn
                color="primary"
                icon
                @click="showText =!showText"
            >
                <v-icon>mdi-magnify</v-icon>
            </v-btn> 

            
            <div>
                <v-slide-x-transition>
                    <v-text-field
                        class="mt-n2"
                        v-model="search"
                        v-show="showText"
                        label="Buscar"
                        placeholder="Buscar Producto"
                        single-line
                        hide-details
                    ></v-text-field>
                </v-slide-x-transition>
            </div>
            
        </v-toolbar>

        <v-data-table
            :headers="headers"
            :items="data"
            :search="search"
            itemsPerPage="9"
        >
            <template v-slot:item.actions="{ item }">

                <v-icon class="mr-2" color="green" @click="show(item.id)" v-if="typeof show == 'function'">
                    mdi-format-list-bulleted
                </v-icon>

                <v-icon class="mr-2" color="primary" v-if="typeof update == 'function'"
                    @click="update(item.id, 'edit')">
                    mdi-pencil
                </v-icon>

                <v-icon color="error" v-if="typeof destroy == 'function'" @click="destroy(item.id, 'delete')">
                    mdi-delete
                </v-icon>

                
                <v-icon color="green" v-if="typeof details == 'function'" @click="details(item.id, 'details')">
                    mdi-chevron-right-box-outline
                </v-icon>
                
                <slot name="action-btn" v-bind:item_id="item.id"></slot>

            </template>

        </v-data-table>
    
    </div>
    `
});