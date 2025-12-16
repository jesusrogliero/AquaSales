'use strict';
import "../utils/data-table.js";
import "../utils/dialog-base.js";
import "../utils/dialog-confirm.js";
import "../utils/autocomplete.js";

export default Vue.component('new-sale', {

    data: function () {
        return {

            sale_id: null,
            client: 'General',
            total_dolar: 0,
            total_bs: 0,
            total_caps: 0,
            total_liters: 0,
            total_units: 0,
            pending_dispatch: 0,
            total_dispatched: 0,
            sate_id: null,

            item_id: null,
            dispatch: null,
            item_pending_dispatch: null,
            product_id: null,
            quantity: null,

            mobile_payment: null,
            reference: null,
            cash_dollar: null,
            cash_bolivares: null,

            falta_dolar: 0,
            falta_bs: 0,
            vuelto_dolar: 0,
            vuelto_bs: 0,

            numberRule: [
                v => !!v || 'Este campo es requerido!!',
                v => /[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?/gm.test(v) || 'Verifique antes de continuar'
            ],

            headers: [
                { text: 'Producto', value: 'product_name' },
                { text: 'Unidades (UNID)', value: 'units', align: 'center' },
                { text: 'Litros (LT)', value: 'liters', align: 'center'},
                { text: 'Tapa (UNID)', value: 'caps', align: 'center'},
                { text: 'Total (BsS)', value: 'total_bs', align: 'center' },
                { text: 'Total ($)', value: 'total_dolar', align: 'center'},
                { text: 'Por Despachar (UNID)', value: 'pending_dispatch', align: 'center'},
                { text: 'Despachados (UNID)', value: 'dispatched', align: 'center'},
                { text: 'Acción', value: 'actions' },
            ],

            title: 'Lista de Productos',
            url: 'index-items',
            dialog: null,
            valid: true,
            bcv: 0,
            overlay: true
        };
    },

    async mounted() {
        try {
            let response = await execute('pending-sale', null);
            this.bcv = await execute('show-bcv', null);

            if (response != null) {

                if (response.code == 0)
                    throw new Error(response.message);

                this.sale_id = response.id;
                this.client = response.client;
                this.state_id = response.state_id;
                this.total_dolar = response.total_dolar;
                this.total_bs = response.total_bs;
                this.total_caps = response.total_caps;
                this.total_liters = response.total_liters;
                this.total_units = response.total_units;
                this.pending_dispatch = response.pending_dispatch;
                this.total_dispatched = response.total_dispatched;

            } else {
                this.createSale();
            }



        } catch (error) {
            alertApp({ color: "error", icon: "alert", text: error.message });
        }
    },

    watch: {
        total_bs() {
            this.checkoutSale();
        },
        cash_bolivares() {
            this.checkoutSale();
        },
        cash_dollar() {
            this.checkoutSale();
        },
        mobile_payment() {
            this.checkoutSale();
        }
    },

    methods: {

        async openDialog(id, dialog) {
            try {
                this.dialog = null;

                if (id != null) {

                    let response = await execute('show-item', id);

                    this.item_id = response.id;
                    this.item_pending_dispatch = response.pending_dispatch;
                }
                this.dialog = dialog;
            } catch (error) {
                alertApp('error', 'alert', error.message);
            }

        },

        closeDialog() {
            //this.$refs.form.reset();
            this.dialog = null;
        },

        cleanSale() {
            this.sale_id = null;
            this.client = null;
            this.state_id = null;
            this.total_dolar = null;
            this.total_bs = null;
            this.total_caps = null;
            this.total_liters = null;
            this.total_units = null;
            this.pending_dispatch = null;
            this.total_dispatched = null;

            this.mobile_payment = null,
                this.reference = null,
                this.cash_dollar = null,
                this.cash_bolivares = null;

            this.falta_dolar = 0;
            this.falta_bs = 0;
            this.vuelto_bs = null;
            this.vuelto_dolar = null;
        },

        validate() {
            if (this.$refs.form.validate() && this.dialog == 'edit')
                this.updateItem();
        },

        async getSale() {
            try {
                let response = await execute('show-sale', this.sale_id);

                if (response.code == 0)
                    throw new Error(response.message);

                this.client = response.client;
                this.total_dolar = response.total_dolar;
                this.total_bs = response.total_bs;
                this.total_caps = response.total_caps;
                this.total_liters = response.total_liters;
                this.total_units = response.total_units;
                this.pending_dispatch = response.pending_dispatch;
                this.total_dispatched = response.total_dispatched;
                this.state_id = response.state_id;

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: response.message });
            } finally {
                this.dialog = null;
            }
        },

        async createSale() {
            try {
                let response = await execute('create-sale', null);

                if (response.code == 0)
                    throw new Error(response.message);

                this.sale_id = response.sale_id;
                await this.getSale();

                await this.$refs.dataTable.getData();
                alertApp({ color: "success", icon: "check", text: response.message });

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.dialog = null;
            }
        },

        async cancelSale() {
            try {
                let response = await execute('destroy-sale', this.sale_id);

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });
                await this.$refs.dataTable.getData();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.cleanSale();
                this.dialog = null;
                this.$router.push('/');
            }
        },

        async updateClientSale() {
            try {
                let response = await execute('update-client-sale', {
                    sale_id: this.sale_id,
                    client: this.client
                });

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            }
        },


        async finalizeSale() {
            try {
                let response = await execute('finalize-sale', {
                    sale_id: this.sale_id,
                    mobile_payment: this.mobile_payment,
                    reference: this.reference,
                    cash_dollar: this.cash_dollar,
                    cash_bolivares: this.cash_bolivares,
                });

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });
                this.cleanSale();
                this.$router.push('/');

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            }
        },

        getSelectProduct(product_id) {
            this.product_id = product_id;
        },

        async checkoutSale() {

            let cantidadDolaresEnBolivares = 0;

            if (this.cash_dollar != null || this.cash_dollar == undefined) {
                cantidadDolaresEnBolivares = parseFloat(this.cash_dollar * this.bcv);
            }

            let totalPagadoBolivares = 0;
            const regex = /^[+]?\d*\.?\d+$/;

            if (regex.test(this.mobile_payment)) {
                totalPagadoBolivares += parseFloat(this.mobile_payment);
            }

            if (regex.test(this.cash_bolivares)) {
                totalPagadoBolivares += parseFloat(this.cash_bolivares);
            }

            if (regex.test(cantidadDolaresEnBolivares)) {
                totalPagadoBolivares += parseFloat(cantidadDolaresEnBolivares);
            }

            // Calcula el vuelto y el faltante
            let vuelto = totalPagadoBolivares - this.total_bs;
            let faltante = 0;

            this.vuelto_bs = 0;
            this.vuelto_dolar = 0;
            this.falta_bs = 0;
            this.falta_dolar = 0;

            // Verifica si hay vuelto o faltante
            if (vuelto >= 0) {
                this.vuelto_bs = parseFloat(vuelto.toFixed(2));
                this.vuelto_dolar = parseFloat(vuelto / this.bcv).toFixed(2);
            } else {
                faltante = vuelto * -1;
                this.falta_bs = faltante.toFixed(2);
                this.falta_dolar = parseFloat(faltante / this.bcv).toFixed(2);
            }
        },

        async createItem() {
            try {
                let response = await execute('create-item', {
                    sale_id: this.sale_id,
                    product_id: this.product_id,
                    quantity: parseInt(this.quantity),
                });

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });
                await this.$refs.dataTable.getData();
                this.getSale();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.quantity = null;
                this.dialog = null;
            }
        },

        async updateItem() {
            try {
                let response = await execute('dispatch-item', {
                    id: this.item_id,
                    dispatch: this.dispatch,
                });

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });
                await this.$refs.dataTable.getData();
                this.getSale();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.dispatch = null;
                this.dialog = null;
            }
        },

        async destroyItem() {
            try {
                let response = await execute('destroy-item', this.item_id);

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });
                await this.$refs.dataTable.getData();
                await this.getSale();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.dialog = null;
            }
        }

    },

    template: `
    <div>

   
    
    <v-card flat class="mb-2 pa-2" color="blue lighten-5">
        <v-btn color="blue darken-3" small dark class="mr-2" v-if="sale_id != null" @click="finalizeSale">
            <v-icon small left>mdi-check-circle</v-icon>
            <span>Finalizar Venta</span>
        </v-btn>

        <v-btn color="blue darken-1" small outlined v-if="sale_id != null" @click="cancelSale">
            <v-icon small left>mdi-close-circle-outline</v-icon>
            <span>Cancelar Venta</span>
        </v-btn>
    </v-card>
    

    
    <v-container v-if="sale_id != null" fluid class="pa-0">
        <v-row dense>
            <v-col cols="12" md="4" lg="4" class="d-flex">
                <v-card elevation="2" class="d-flex flex-column" style="width: 100%;">
                    <v-card-title class="blue darken-2 white--text py-2">
                        <v-icon small left color="white">mdi-clipboard-text</v-icon>
                        <span class="body-2 font-weight-bold">Detalles de la Venta</span>
                    </v-card-title>
                    <v-card-text class="pa-2">
                        <v-text-field 
                            v-model="client" 
                            dense 
                            @blur="updateClientSale"
                            label="Cliente" 
                            placeholder="Nombre del cliente"
                            outlined
                            hide-details
                            color="blue darken-2"
                            prepend-inner-icon="mdi-account"
                            class="mb-2"
                            style="font-size: 13px;"
                        ></v-text-field>
                        
                        <v-divider class="my-1"></v-divider>
                        
                        <div class="py-1 d-flex align-center">
                            <v-chip small color="blue lighten-4" text-color="blue darken-3">
                                <v-icon small left>mdi-package-variant</v-icon>
                                Unid.
                            </v-chip>
                            <span class="ml-auto body-2 font-weight-bold blue--text text--darken-2">{{total_units}} UNID</span>
                        </div>
                        <div class="py-1 d-flex align-center">
                            <v-chip small color="blue lighten-4" text-color="blue darken-3">
                                <v-icon small left>mdi-water</v-icon>
                                Litros
                            </v-chip>
                            <span class="ml-auto body-2 font-weight-bold blue--text text--darken-2">{{total_liters}} L</span>
                        </div>
                        <div class="py-1 d-flex align-center">
                            <v-chip small color="blue lighten-4" text-color="blue darken-3">
                                <v-icon small left>mdi-bottle-tonic</v-icon>
                                Tapas
                            </v-chip>
                            <span class="ml-auto body-2 font-weight-bold blue--text text--darken-2">{{total_caps}} UNID</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="4" lg="4" class="d-flex">
                <v-card elevation="2" class="d-flex flex-column" style="width: 100%;">
                    <v-card-title class="blue darken-2 white--text py-2">
                        <v-icon small left color="white">mdi-cash-multiple</v-icon>
                        <span class="body-2 font-weight-bold">Totales por Pagar</span>
                    </v-card-title>
                    <v-card-text class="pa-2">
                        <v-chip small :color="sate_id == 1 ? 'blue lighten-3' : 'blue darken-1'" dark class="mb-1">
                            <v-icon small left>mdi-information</v-icon>
                            {{sate_id != 1 ? 'Pendiente' : 'Finalizado'}}
                        </v-chip>
                        
                        <v-divider class="my-1"></v-divider>
                        
                        <div class="d-flex align-center py-1">
                            <v-icon small color="blue darken-2" class="mr-1">mdi-currency-usd</v-icon>
                            <span class="body-2">Total $:</span>
                            <span class="ml-auto font-weight-bold blue--text text--darken-3 subtitle-1">{{total_dolar}} $</span>
                        </div>
                        
                        <div class="d-flex align-center py-1">
                            <v-icon small color="blue darken-2" class="mr-1">mdi-currency-brl</v-icon>
                            <span class="body-2">Total BsS:</span>
                            <span class="ml-auto font-weight-bold blue--text text--darken-3 subtitle-1">{{total_bs}} BsS</span>
                        </div>

                        <v-divider class="my-1"></v-divider>

                        <div class="d-flex align-center py-1">
                            <v-icon small color="orange darken-2" class="mr-1">mdi-clock-alert-outline</v-icon>
                            <span class="body-2">Por Despachar:</span>
                            <span class="ml-auto body-2 font-weight-bold orange--text text--darken-2">{{pending_dispatch}} UNID</span>
                        </div>
                        
                        <div class="d-flex align-center py-1">
                            <v-icon small color="blue darken-2" class="mr-1">mdi-check-circle</v-icon>
                            <span class="body-2">Despachado:</span>
                            <span class="ml-auto body-2 font-weight-bold blue--text text--darken-2">{{total_dispatched}} UNID</span>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>


            <v-col cols="12" md="4" lg="4" class="d-flex">
                <v-card elevation="2" class="d-flex flex-column" style="width: 100%;">
                    <v-card-title class="blue darken-2 white--text py-2">
                        <v-icon small left color="white">mdi-credit-card</v-icon>
                        <span class="body-2 font-weight-bold">Detalles del Pago</span>
                    </v-card-title>
                    <v-card-text class="pa-2">
                        <v-row dense>
                            <v-col cols="6">
                                <v-text-field 
                                    v-model="mobile_payment" 
                                    type="number" 
                                    dense 
                                    label="Pago Móvil" 
                                    suffix="BsS" 
                                    outlined
                                    hide-details
                                    color="blue darken-2"
                                    prepend-inner-icon="mdi-cellphone"
                                    style="font-size: 13px;"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field 
                                    v-model="reference" 
                                    dense 
                                    suffix="Nro" 
                                    label="Referencia" 
                                    outlined
                                    hide-details
                                    color="blue darken-2"
                                    prepend-inner-icon="mdi-pound"
                                    style="font-size: 13px;"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field 
                                    v-model="cash_dollar" 
                                    dense 
                                    type="number" 
                                    label="Efectivo $" 
                                    suffix="$"  
                                    outlined
                                    hide-details
                                    color="blue darken-2"
                                    prepend-inner-icon="mdi-cash-usd"
                                    style="font-size: 13px;"
                                ></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field 
                                    v-model="cash_bolivares" 
                                    dense 
                                    type="number" 
                                    label="Efectivo BsS" 
                                    suffix="BsS"  
                                    outlined
                                    hide-details
                                    color="blue darken-2"
                                    prepend-inner-icon="mdi-cash"
                                    style="font-size: 13px;"
                                ></v-text-field>
                            </v-col>
                            
                            <v-col cols="12">
                                <v-divider class="my-1"></v-divider>
                            </v-col>

                            <v-col cols="6" class="py-1">
                                <v-card flat color="blue lighten-5" class="pa-1">
                                    <div class="body-2 blue--text text--darken-2">Vuelto $</div>
                                    <div class="subtitle-2 font-weight-bold blue--text text--darken-3">{{vuelto_dolar}} $</div>
                                </v-card>
                            </v-col>

                            <v-col cols="6" class="py-1">
                                <v-card flat color="orange lighten-5" class="pa-1">
                                    <div class="body-2 orange--text text--darken-2">Falta $</div>
                                    <div class="subtitle-2 font-weight-bold orange--text text--darken-3">{{falta_dolar}} $</div>
                                </v-card>
                            </v-col>

                            <v-col cols="6" class="py-1">
                                <v-card flat color="blue lighten-5" class="pa-1">
                                    <div class="body-2 blue--text text--darken-2">Vuelto BsS</div>
                                    <div class="subtitle-2 font-weight-bold blue--text text--darken-3">{{vuelto_bs}} BsS</div>
                                </v-card>
                            </v-col>

                            <v-col cols="6" class="py-1">
                                <v-card flat color="orange lighten-5" class="pa-1">
                                    <div class="body-2 orange--text text--darken-2">Falta BsS</div>
                                    <div class="subtitle-2 font-weight-bold orange--text text--darken-3">{{falta_bs}} BsS</div>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

    <div class="my-4"></div>
    
        <!-- Dialogo de confirmacion antes de eliminar -->
        <dialog-confirm v-if="sale_id != null" :active="dialog == 'delete'" :confirm="destroyItem" :cancel="closeDialog">
            
            <template v-slot:dialog-title>
            <span class="title">Eliminar Producto?</span>
            </template>
            
            <template v-slot:dialog-content>
                <span class="headline">
                    Esta seguro de que desea eliminar este Producto?
                </span>
            </template>
        </dialog-confirm>

        <!-- Dialogo para crear o actualizar recursos -->
        <dialog-base v-if="sale_id != null" :active="dialog == 'edit'">
            <template v-slot:dialog-title>
                <span class="title">Editar Despacho</span>
            </template>

            <template v-slot:dialog-content>

                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="item_pending_dispatch" suffix="UNID" readonly label="Pendiente Por Despachar"
                                placeholder="Cuanto desea despachar"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="dispatch" suffix="UNID" :rules="numberRule" type="number" label="Cantidad a Despachar" required
                                placeholder="Cuanto desea despachar"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </template>

            <template v-slot:dialog-actions>
                <v-btn :disabled="!valid" color="blue darken-2" dark small class="mr-2"
                    @click="validate">
                    <v-icon small left>mdi-check</v-icon>
                    <span>Guardar</span>
                </v-btn>

                <v-btn @click="closeDialog" color="blue darken-1" small outlined>
                    <v-icon small left>mdi-close</v-icon>
                    <span>Cancelar</span>
                </v-btn>
            </template>
        </dialog-base>


        <data-table 
            v-if="sale_id != null"
            ref="dataTable"
            :url="url" 
            :headers="headers" 
            :title="title"
            :update="openDialog"
            :destroy="openDialog"
            :sale_id="sale_id"
        >
            <template v-slot:toolbar>
                <div class="mt-2">
                    <v-row dense align="center">
                        <v-col cols="12" md="5">
                            <autocomplete-form 
                                uri="index-sale-products"
                                label="Selecciona un Producto"
                                column="name" 
                                itemValue="id" 
                                :defaultValue="product_id"
                                :getSelect="getSelectProduct" 
                            />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field 
                                v-model="quantity" 
                                type="number"
                                suffix="UNID" 
                                label="Cantidad"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-btn @click="createItem" class="mt-n4" color="blue darken-2" small text>
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
            </template>
        </data-table>
        
        </div>
    `
});