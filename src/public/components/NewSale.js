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

            product_id: null,
            quantity: null,

            headers: [
                { text: 'Producto', value: 'product_name' },
                { text: 'Unidades', value: 'units' },
                { text: 'Litros', value: 'liters' },
                { text: 'Tapa', value: 'caps' },
                { text: 'Total en BsS', value: 'total_bs' },
                { text: 'Total en $', value: 'total_dolar' },
                { text: 'Acción', value: 'actions' },
            ],

            title: 'Lista de Productos',
            url: 'index-items',
            dialog: null,
            valid: true
        };
    },

    methods: {

        async openDialog(id, dialog) {
            try {
                this.dialog = null;

                if (id != null) {

                    let response = await execute('show-item', id);

                    this.id = response.id;
                    this.name = response.name;
                    this.liters = response.liters;
                    this.quantity = response.quantity;
                    this.price_bs = response.price_bs;
                    this.price_dolar = response.price_dolar
                }
                this.dialog = dialog;
            } catch (error) {
                alertApp('error', 'alert', error.message);
            }

        },

        closeDialog() {
            this.$refs.form.reset();
            this.dialog = null;
        },

        cleanForm() {
            this.product_id = null;
            this.quantity = null;
            this.dialog = null; 
        },

        cleanSale() {
            this.sale_id = null;
            this.name = null;
            this.liters = null;
            this.quantity = null;
            this.price_bs = null;
            this.price_dolar = null;
            this.dialog = null; 
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
                this.cleanForm();
                this.cleanSale();
                this.dialog = null;
            }
        },

        getSelectProduct(product_id) {
            this.product_id = product_id;
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
                this.dialog = null;
            }
        },

        async destroyItem() {
            try {
                let response = await execute('destroy-item', this.id);

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });
                await this.$refs.dataTable.getData();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.cleanForm();
                this.dialog = null;
            }
        }

    },

    template: `
    <div>
    
    <div class="mb-4">
        <v-btn color="green" dark class="mr-3" @click="createSale">
            <span>Crear Venta</span>
            <v-icon>mdi-file-plus</v-icon>
        </v-btn>

        <v-btn color="red" dark class="mr-3" v-if="sale_id != null" @click="cancelSale">
            <span>Cancelar Venta</span>
            <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>

        <v-btn color="purple" dark v-if="sale_id != null">
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
                        <b>Cliente: </b>
                        <span class="float-right">{{client}}</span>
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
                        <span class="float-right"> Pendiente</span>
                    </v-col>

                    <v-col cols="12">
                        <b>Total en BsS: </b>
                        <span class="float-right">{{total_bs}} BsS</span>
                    </v-col>

                    <v-col cols="12">
                        <b>Total en Dolares: </b>
                        <span class="float-right">{{total_dolar}} $</span>
                    </v-col>
                </v-row>
            </v-col>


            <v-col cols="12" md="6" lg="4" class="card-info-invoice">
                <v-row>
                    <v-col cols="12" class="text-center">
                        <h3>Detalles del Pago</h3>
                    </v-col>

                    <v-col cols="6">
                        <v-text-field class="mb-n6" dense label="Pago Movil" suffix="BsS" filled></v-text-field>
                    </v-col>

                    <v-col cols="6">
                        <v-text-field dense class="mb-n6" label="Efectivo" suffix="$"  filled></v-text-field>
                    </v-col>

                    <v-col cols="12">
                        <v-text-field dense class="mb-n6" label="Efectivo BsS" suffix="BsS"  filled></v-text-field>
                    </v-col>

                    <v-col cols="6">
                        <b>Vuelto $: </b>
                        <span class="float-right"> 150 $</span>
                    </v-col>

                    <v-col cols="6">
                        <b>Vuelto BsS: </b>
                        <span class="float-right"> 150 BsS</span>
                    </v-col>
                  

                </v-row>
            </v-col>
        </v-row>
    </v-container>

    
        <!-- Dialogo de confirmacion antes de eliminar -->
        <dialog-confirm v-if="sale_id != null" :active="dialog == 'delete'" :confirm="destroyItem" :cancel="cleanForm">
            
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
        <dialog-base v-if="sale_id != null" :active="dialog == 'new' || dialog == 'edit'">
            <template v-slot:dialog-title>
                <span class="title">{{ dialog == 'edit' ? 'Editar Producto' : 'Nuevo Producto'}}</span>
            </template>

            <template v-slot:dialog-content>

                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="name" :rules="requiredRule" label="Nombre" required
                                placeholder="Ingresa el nombre del Producto"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="liters" :rules="numberRule" label="Litros" required
                                placeholder="Ingresa el volumen de la botella" suffix="Lt"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="quantity" suffix="UNID" :rules="numberRule" label="Cantidad" required
                                placeholder="Ingresa la cantidad del producto"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="price_bs" suffix="BsS" :rules="numberRule" label="Precio en Bs" required
                                placeholder="Ingresa el precio en Bolivares"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="price_dolar" suffix="$" :rules="numberRule" label="Precio en Dolares" required
                                placeholder="Ingresa el precio en Dolares"></v-text-field>
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