'use strict';
import "../utils/dialog-base.js";

var AdminAutenticate = Vue.component('admin-autenticate', {

    data: function () {
        return {
            dialog: null,
            password: null,
            admin_name: null,
            session: false
        };
    },

    mounted(){
        this.session = localStorage.getItem('session');
    },

    methods: {

        async openDialog() {
            try {
                let response = await execute('get-admin-name');

                if (response.code === 0) {
                    throw new Error(response.message)
                }
                this.admin_name = response.name;
                this.dialog = true;
            
            } catch (error) {
                console.log(error);
                alertApp('error', 'alert', error.message);
            }
        },

        async validate() {
            try {
                let response = await execute('admin-autenticate', this.password);

                if (response.code === 0) {
                    throw new Error(response.message)
                }
                console.log(response);
                this.admin_name = null;
                this.dialog = null;
                window.localStorage.setItem('session', response);
           
            } catch (error) {
                console.log(error);
                alertApp('error', 'alert', error.message);
            }
        },

        closeDialog() {
            this.dialog = null;
        }
    },

    template: `
		<div>

        <v-btn icon @click="openDialog">
            <v-icon size="30" v-if="session == true">mdi-account-lock-open-outline</v-icon>
            <v-icon size="30" v-else >mdi-account-lock-outline</v-icon>
        </v-btn>

            <dialog-base :active="dialog">
                <template v-slot:dialog-title>
                    <span class="title">Hola {{admin_name}}!!, Ingresa tu contraseña</span>
                </template>

                <template v-slot:dialog-content>

                    <v-form>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="password" type="password" label="Contraseña"
                                    placeholder="Ingresa tu contraseña de administrador"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </template>

                <template v-slot:dialog-actions>
                    <v-btn color="transparent" text style="color:#2c823c !important;" class="mr-4"
                        @click="validate">
                        <span>Guardar</span>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>

                    <v-btn @click="closeDialog" color="transparent" text style="color: #f44336 !important;">
                        <span>Cancelar</span>
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </template>
            </dialog-base>
			
		</div>
	`
});

export default AdminAutenticate;