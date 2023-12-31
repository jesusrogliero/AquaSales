'use strict';
import "../utils/data-table.js";
import "../utils/dialog-base.js";
import "../utils/dialog-confirm.js";
import "../utils/autocomplete.js";

export default Vue.component('outstanding-payments', {
    
    data: function () {
        return {
            id: null,
            client: null,
            product_id: null,
            quantity: null,
            debt_bs: null,
            debt_dolar: null,

            requiredRule: [v => !!v || 'Este campo es requerido!!'],
		
            headers: [
                { text: 'Cliente', value: 'client' },
                { text: 'Producto', value: 'product' },
                { text: 'Cantidad', value: 'quantity' },
                { text: 'Deuda en BsS', value: 'debt_bs' },
                { text: 'Deuda en USD', value: 'debt_dolar' },
                { text: 'Acción', value: 'actions' },
              ],

              title: 'Gestion de Pagos Pendientes',
              url: 'index-outstanding-payments',
              dialog: null,
              valid: true
        };
    },
    
    methods: {
        
        async openDialog(id, dialog) {
			try {
				this.dialog = null;

				if (id != null) {

                    let response = await execute('show-outstanding-payment', id);

					this.id = response.id;
					this.client = response.client;
                    this.product_id = response.product_id;
                    this.quantity = response.quantity;
					this.debt_bs = response.debt_bs;
					this.debt_dolar = response.debt_dolar;
				}
				this.dialog = dialog;
			} catch (error) {
				alertApp('error', 'alert', error.message);
			}

		},

        getSelectProduct(product_id) {
            this.product_id = product_id;
        },

        closeDialog() {
			this.$refs.form.reset();
			this.dialog = null;
		},

        cleanForm() {
			this.id = null;
			this.client = null;
			this.debt_bs = null;
			this.debt_dolar = null;
		},

        validate() {
			if (this.$refs.form.validate() && this.dialog == 'new')
				this.create();

			if (this.$refs.form.validate() && this.dialog == 'edit')
				this.update();

		},

        async create() {
			try {
                let response = await execute('create-outstanding-payment', {
                    client: this.client,
                    product_id: this.product_id,
                    quantity: this.quantity
                });

				if (response.code == 0)
					throw new Error(response.message);

				await this.$refs.dataTable.getData();
				alertApp({color: "success",icon: "check", text: response.message});

			} catch (error) {
                alertApp({color: "error", icon: "alert", text: error.message});
			} finally {
				this.$refs.form.reset();
				this.dialog = null;
			}

		},

		async update() {
			try {
                let response = await execute('update-outstanding-payment', {
                    id: this.id,
                    client: this.client,
                    product_id: this.product_id,
                    quantity: this.quantity
                });

				if (response.code == 0)
					throw new Error(response.message);

                alertApp({color: "success",icon: "check", text: response.message});
				await this.$refs.dataTable.getData();

			} catch (error) {
                alertApp({color: "error", icon: "alert", text: error.message});
			} finally {
				this.$refs.form.reset();
				this.dialog = null;
			}

		},

		async destroy() {
			try {
                let response = await execute('destroy-outstanding-payment', this.id);

				if (response.code == 0)
					throw new Error(response.message);

				alertApp({color: "success",icon: "check", text: response.message});
				await this.$refs.dataTable.getData();

			} catch (error) {
                alertApp({color: "error", icon: "alert", text: response.message});
			} finally {
				this.cleanForm();
				this.dialog = null;
			}
		}

    },

    template: `
    <div>

        <!-- Dialogo de confirmacion antes de eliminar -->
        <dialog-confirm :active="dialog == 'delete'" :confirm="destroy" :cancel="cleanForm">
            
            <template v-slot:dialog-title>
            <span class="title">Eliminar esta Deuda?</span>
            </template>
            
            <template v-slot:dialog-content>
                <span class="headline">
                    Esta seguro de que desea eliminar este pago pendiente?
                </span>
            </template>
        </dialog-confirm>

        <!-- Dialogo para crear o actualizar recursos -->
        <dialog-base :active="dialog == 'new' || dialog == 'edit'" max-width="300">
            <template v-slot:dialog-title>
                <span class="title">{{ dialog == 'edit' ? 'Editar Pago Pendiente' : 'Nuevo Pago Pendiente'}}</span>
            </template>

            <template v-slot:dialog-content>

                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>

                        <v-col cols="12" class="mb-n5">
                            <v-text-field v-model="client" :rules="requiredRule" label="Cliente" required
                                placeholder="Ingresa el nombre del Cliente"></v-text-field>
                        </v-col>

                        <v-col cols="12" class="mb-n5">
                            <v-text-field v-model="quantity" type="number" label="Cantidad"
                                placeholder="Ingresa la cantidad pendiente" suffix="Lt"></v-text-field>
                        </v-col>

                        <v-col cols="12" class="mb-n5">
                            <autocomplete-form
                                uri="index-products"
                                label="Selecciona un Producto"
                                column="name" 
                                itemValue="id" 
                                :defaultValue="product_id"
                                :getSelect="getSelectProduct" 
                            />
                        </v-col>

                        <v-col cols="6"  v-if="dialog == 'edit'">
                        <v-text-field v-model="debt_bs" suffix="BsS" type="number" readonly label="Deuda en BsS"
                            placeholder="Ingresa el pago pendiente en Dolares"></v-text-field>
                    </v-col>

                    <v-col cols="6" v-if="dialog == 'edit'">
                    <v-text-field v-model="debt_dolar" suffix="USD" type="number" readonly label="Deuda en USD"
                        placeholder="Ingresa el pago pendiente en Dolares"></v-text-field>
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
            ref="dataTable"
            :url="url" 
            :headers="headers" 
            :title="title"
            :add="openDialog"
            :update="openDialog"
            :destroy="openDialog"
        ></data-table>
    </div>
    `
});