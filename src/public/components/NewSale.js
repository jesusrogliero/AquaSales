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
                { text: 'Unidades', value: 'units' },
                { text: 'Litros', value: 'liters' },
                { text: 'Tapa', value: 'caps' },
                { text: 'Total en BsS', value: 'total_bs' },
                { text: 'Total en $', value: 'total_dolar' },
                { text: 'Pendiente por Despachar', value: 'pending_dispatch' },
                { text: 'Despachado', value: 'dispatched' },
                { text: 'Acción', value: 'actions' },
            ],

            title: 'Lista de Productos',
            url: 'index-items',
            dialog: null,
            valid: true,
            bcv: 0
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

            if(regex.test(this.mobile_payment)) {
                totalPagadoBolivares += parseFloat(this.mobile_payment);
            }

            if( regex.test(this.cash_bolivares)) {
                totalPagadoBolivares += parseFloat(this.cash_bolivares);
            }

            if(regex.test(cantidadDolaresEnBolivares)) {
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
                this.vuelto_dolar =  parseFloat(vuelto / this.bcv).toFixed(2);
            } else {
                faltante = vuelto * -1;
                this.falta_bs = faltante.toFixed(2);
                this.falta_dolar =  parseFloat(faltante / this.bcv).toFixed(2);
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
    
    <div class="mb-4">
        <v-btn color="green" dark class="mr-3" v-if="sale_id == null" @click="createSale">
            <span>Crear Venta</span>
            <v-icon>mdi-file-plus</v-icon>
        </v-btn>

        <v-btn color="red" dark class="mr-3" v-if="sale_id != null" @click="cancelSale">
            <span>Cancelar Venta</span>
            <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>

        <v-btn color="purple" dark v-if="sale_id != null" @click="finalizeSale">
                <span>Finalizar Venta</span>
        <v-icon>mdi-check</v-icon>
    </v-btn>
    </div>
    

    
    <v-container v-if="sale_id != null">
        <v-row>
            <v-col cols="12" md="6" lg="4" class="card-info-invoice">
                <v-row>
                    <v-col cols="12" class="text-center">
                        <h3>Detalles de la Venta</h3>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field 
                            v-model="client" 
                            class="mb-n6" 
                            dense 
                            label="Nombre del Cliente" 
                            placeholder="Ingresa el nombre del cliente"
                            append-icon="mdi-content-save-edit"
                            @click:append="updateClientSale"
                            filled
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <b>Unidades Totales: </b>
                        <span class="float-right"> {{total_units}} UNID</span>
                    </v-col>
                    <v-col cols="12">
                        <b>Litros Totales: </b>
                        <span class="float-right">{{total_liters}} L</span>
                    </v-col>
                    <v-col cols="12">
                        <b>Total de Tapas: </b>
                        <span class="float-right"> {{total_caps}} UNID</span>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="12" md="6" lg="4" class="card-info-invoice">
                <v-row>

                    <v-col cols="12" class="text-center">
                        <h3>Totales por Pagar</h3>
                    </v-col>

                    <v-col cols="12">
                        <b>Estado: </b>
                        <span class="float-right"> {{sate_id == 1 ? 'Pendiente' : ''}}</span>
                    </v-col>

                    <v-col cols="12">
                        <b>Total en BsS: </b>
                        <span class="float-right">{{total_bs}} BsS</span>
                    </v-col>

                    <v-col cols="12">
                        <b>Total en Dolares: </b>
                        <span class="float-right">{{total_dolar}} $</span>
                    </v-col>

                    <v-col cols="12">
                        <b>Pendientes por Despachar: </b>
                        <span class="float-right red--text">{{pending_dispatch}} UNID</span>
                    </v-col>

                    
                    <v-col cols="12">
                        <b>Total Despachado: </b>
                        <span class="float-right green--text">{{total_dispatched}} UNID</span>
                    </v-col>
                    

                </v-row>
            </v-col>


            <v-col cols="12" md="6" lg="4" class="card-info-invoice">
                <v-row>
                    <v-col cols="12" class="text-center">
                        <h3>Detalles del Pago</h3>
                    </v-col>

                    <v-col cols="6">
                        <v-text-field v-model="mobile_payment" class="mb-n6" dense label="Pago Movil" suffix="BsS" filled></v-text-field>
                    </v-col>

                    <v-col cols="6">
                        <v-text-field v-model="reference" dense class="mb-n6" suffix="Nro" label="Referencia" filled></v-text-field>
                    </v-col>

                    <v-col cols="6">
                        <v-text-field v-model="cash_dollar" dense class="mb-n6" label="Efectivo" suffix="$"  filled></v-text-field>
                    </v-col>

                    <v-col cols="6">
                        <v-text-field v-model="cash_bolivares" dense class="mb-n6" label="Efectivo BsS" suffix="BsS"  filled></v-text-field>
                    </v-col>

                    <v-col cols="6">
                        <b>Vuelto $: </b>
                        <span class="float-right"> {{vuelto_dolar}} $</span>
                    </v-col>

                    <v-col cols="6">
                        <b>Falta en $: </b>
                        <span class="float-right"> {{falta_dolar}} $</span>
                    </v-col>

                    <v-col cols="6">
                        <b>Vuelto BsS: </b>
                        <span class="float-right"> {{vuelto_bs}} BsS</span>
                    </v-col>

                    <v-col cols="6">
                        <b>Falta en BsS: </b>
                        <span class="float-right"> {{falta_bs}} BsS</span>
                    </v-col>
                  

                </v-row>
            </v-col>
        </v-row>
    </v-container>

    
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
                            <v-text-field v-model="dispatch" suffix="UNID" :rules="numberRule" label="Cantidad a Despachar" required
                                placeholder="Cuanto desea despachar"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </template>

            <template v-slot:dialog-actions>
                <v-btn :disabled="!valid" color="transparent" text style="color:#2c823c !important;" class="mr-4"
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
                <div class="mt-4">

                    <v-row>

                        <col cols="4">
                            <autocomplete-form 
                                uri="index-products"
                                label="Selecciona un Producto"
                                column="name" 
                                itemValue="id" 
                                :defaultValue="product_id"
                                :getSelect="getSelectProduct" 
                            />
                        </col>

                        <col cols="4">
                            <v-text-field 
                                class="ml-3"
                                v-model="quantity" 
                                suffix="UNID" 
                                label="Cantidad"
                                size="9"
                            ></v-text-field>
                        </col>

                        <col cols="4">
                            <v-btn class="ml-3 mr-3" @click="createItem" color="transparent" text style="color: green !important;">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </col>
                    </v-row>
            
                </div>
           
            </template>
        </data-table>
        
        </div>
    `
});