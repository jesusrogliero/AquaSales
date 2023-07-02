'use strict';

export default Vue.component('navigation', {

    data: function () {
        return {

        };
    },

    methods: {
        toHome() { this.$router.push('/'); },
        toProducts() { this.$router.push('/products'); },
        toSales() { this.$router.push('/sales'); },
        toPayments() { this.$router.push('/payments'); },
        toNewSale() { this.$router.push('/new_sale'); },
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
    
       
        <v-btn color="blue lighten-3" class="mr-n3" elevation="0" @click="toNewSale">
            <v-icon>mdi-plus</v-icon>
            <span>Nueva Venta</span>  
        </v-btn>
        
        <v-btn color="blue lighten-3" class="mr-n3"  elevation="0" @click="toProducts">
            <v-icon>mdi-bottle-wine</v-icon>
        <span>Productos</span>  
        </v-btn>
        
        <v-btn color="blue lighten-3" class="mr-n3" elevation="0" @click="toSales">
            <v-icon>mdi-clipboard-check-outline</v-icon>
            <span>Ventas</span>  
        </v-btn>

        <v-btn color="blue lighten-3" elevation="0" @click="toPayments">
        <v-icon>mdi-currency-usd</v-icon>
        <span>Pagos</span>  
    </v-btn>

    </v-app-bar>
    `
});