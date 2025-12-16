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

    mounted() {
        if (localStorage.getItem('session') == 'active') {
            this.session = true;
        }

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
                alertApp({color: "error", icon: "alert", text: error.message});
            }
        },

        async validate() {
            try {
                let response = await execute('admin-autenticate', this.password);

                if (response.code === 0) {
                    throw new Error(response.message)
                }

                this.admin_name = null;
                this.dialog = null;
                this.session = response;
                window.localStorage.setItem('session', 'active');

            } catch (error) {
                console.log(error);
                alertApp({color: "error", icon: "alert", text: error.message});
            } finally {
                this.password = null;
            }
        },

        async logout() {
            try {
                let response = await execute('logout');

                if (response.code === 0) {
                    throw new Error(response.message)
                }
                window.localStorage.setItem('session', null);
                this.session = null;
            } catch (error) {
                alertApp({color: "error", icon: "alert", text: error.message});
            }
        },

        closeDialog() {
            this.dialog = null;
        }
    },

    template: `

    <div>
        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn 
                    v-if="session != true" 
                    icon 
                    @click="openDialog"
                    v-bind="attrs"
                    v-on="on"
                    class="elevation-2"
                    style="background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);"
                >
                    <v-icon size="28" color="white">mdi-shield-lock</v-icon>
                </v-btn>

                <v-btn 
                    v-else 
                    icon 
                    @click="logout"
                    v-bind="attrs"
                    v-on="on"
                    class="elevation-2"
                    style="background: linear-gradient(135deg, #42A5F5 0%, #2196F3 100%);"
                >
                    <v-icon size="28" color="white">mdi-shield-check</v-icon>
                </v-btn>
            </template>
            <span>{{ session ? 'Cerrar sesión' : 'Iniciar sesión como administrador' }}</span>
        </v-tooltip>

        <dialog-base :active="dialog" :max-width="520">
            <template v-slot:dialog-title>
              
                    <h2 style="color: white; font-weight: 400; font-size: 26px; margin: 0;">¡Hola, {{admin_name}}!</h2>
           
            </template>

            <template v-slot:dialog-content>
                <div style="padding: 45px 35px 30px 35px;">
                    <v-text-field 
                        v-model="password" 
                        type="password" 
                        label="Contraseña de Administrador"
                        placeholder="Ingresa tu contraseña"
                        outlined
                        color="#1976D2"
                        prepend-inner-icon="mdi-lock-outline"
                        :append-icon="password ? 'mdi-check-circle' : ''"
                        @keyup.enter="validate"
                    >
                    </v-text-field>
                    
                    <div style="text-align: center; margin-top: 15px;">
                        <p style="font-size: 13px; color: #666; margin: 0; display: flex; align-items: center; justify-content: center;">
                            <v-icon small color="#1976D2" style="margin-right: 8px;">mdi-information</v-icon>
                            Ingresa tus credenciales para acceder al panel administrativo
                        </p>
                    </div>
                </div>
            </template>

            <template v-slot:dialog-actions>
                <div style="width: 100%; padding: 20px 25px 25px 25px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    <v-btn 
                        color="#1976D2" 
                        dark
                        large
                        class="px-10 elevation-2"
                        style="text-transform: none; font-weight: 500; border-radius: 8px; min-width: 180px;"
                        @click="validate"
                    >
                        <v-icon left>mdi-login</v-icon>
                        <span>Iniciar Sesión</span>
                    </v-btn>

                    <v-btn 
                        @click="closeDialog" 
                        outlined
                        large
                        color="#1976D2"
                        class="px-10"
                        style="text-transform: none; font-weight: 500; border-radius: 8px; min-width: 180px;"
                    >
                        <v-icon left>mdi-close</v-icon>
                        <span>Cancelar</span>
                    </v-btn>
                </div>
            </template>
        </dialog-base>        
    </div>
	`
});

export default AdminAutenticate;