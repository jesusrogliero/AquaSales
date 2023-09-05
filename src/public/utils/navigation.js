'use strict';

export default Vue.component('navigation', {

    methods: {
        toHome() { this.$router.push('/'); },
        toProducts() { this.$router.push('/products'); },
        toSales() { this.$router.push('/sales'); },
        toPayments() { this.$router.push('/payments'); },
        toDispatchedSales() { this.$router.push('/dispatched_sales')},
        toPayrolls() { this.$router.push('/payrolls')},
        toOutstandingPayment() { this.$router.push('/outstanding_payments')}
    },

    template: `
        
    <v-app-bar
        app
        absolute
        color="#0D47A1"
    >

        <v-toolbar-title>
            <h3 class="white--text" >Embotelladora San Miguel Arcangel</h3>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn color="blue lighten-3" class="mr-n3" elevation="0" @click="toHome">
            <v-icon>mdi-home</v-icon>
            <span>Inicio</span>  
        </v-btn>
        
        <v-btn color="blue lighten-3" class="mr-n3"  elevation="0" @click="toProducts">
            <v-icon>mdi-bottle-wine</v-icon>
        <span>Productos</span>  
        </v-btn>
        
        <v-btn color="blue lighten-3" class="mr-n3" elevation="0" @click="toSales">
            <v-icon>mdi-clipboard-clock-outline</v-icon>
            <span>Ventas</span>  
        </v-btn>

        <v-btn color="blue lighten-3" class="mr-n3" elevation="0" @click="toOutstandingPayment">
            <v-icon>mdi-cash-clock</v-icon>
            <span>Pagos Pendientes</span>  
        </v-btn>

        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn color="blue lighten-3" elevation="0" v-bind="attrs" v-on="on">
                    <v-icon>mdi-menu-open</v-icon>
                    <span>Mas</span>  
                </v-btn>
            </template>
            <v-list>

                <v-list-item @click="toDispatchedSales">
                    <v-list-item-title>
                        <v-icon class="mr-2" >mdi-clipboard-check</v-icon>
                        <span>Ventas Despachadas</span>  
                    </v-list-item-title>
                </v-list-item>
            
                <v-divider></v-divider>

                <v-list-item @click="toPayments">
                    <v-list-item-title>
                        <v-icon class="mr-2">mdi-currency-usd</v-icon>
                        <span>Pagos</span>
                    </v-list-item-title>
                </v-list-item>
        
                <v-divider></v-divider>

                <v-list-item @click="toPayrolls" disabled>
                    <v-list-item-title>
                        <v-icon class="mr-2">mdi-account-group-outline</v-icon> 
                        Empleado
                    </v-list-item-title>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item @click="toPayrolls" disabled>
                    <v-list-item-title>
                        <v-icon class="mr-2">mdi-account-credit-card-outline</v-icon>
                        Nomina
                    </v-list-item-title>
                </v-list-item>

               
            </v-list>
        </v-menu>

    </v-app-bar>
    `
});