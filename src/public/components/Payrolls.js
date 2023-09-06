'use strict';
import "../utils/data-table.js";
import "../utils/dialog-base.js";
import "../utils/dialog-confirm.js";
import "../utils/autocomplete.js";

export default Vue.component('payrolls', {
    
    data: function () {
        return {
            id: null,
            employe_id: null,
            payment_bs: null,
            payment_dolar: null,
            discount_bs: null,
            discount_dolar: null,

            requiredRule: [v => !!v || 'Este campo es requerido!!'],
			numberRule: [
				v => !!v || 'Este campo es requerido!!',
				v => /[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?/gm.test(v) || 'Verifique antes de continuar'
			],

            headers: [
                { text: 'Empleado', value: 'employe_name' },
                { text: 'Pago en Bs', value: 'payment_bs' },
                { text: 'Pago en $', value: 'payment_dolar' },
                { text: 'Descuento en BsS', value: 'discount_bs' },
                { text: 'Descuento en $', value: 'discount_dolar' },
                { text: 'Total Neto BsS', value: 'total_bs' },
                { text: 'Total Neto $', value: 'total_dolar' },
                { text: 'Acción', value: 'actions' },
              ],

              title: 'Gestión De Nomina',
              url: 'index-payrolls',
              dialog: null,
              valid: true
        };
    },
    
    methods: {
        
        async openDialog(id, dialog) {
			try {
				this.dialog = null;

				if (id != null) {

                    let response = await execute('show-product', id);

                    if(response.code == 0) {
                        throw new Error(response.message);
                    }

					this.id = response.id;
					this.employe_id = response.employe_id;
					this.payment_bs = response.payment_bs;
					this.payment_dolar = response.payment_dolar;
                    this.discount_bs = response.discount_bs;
                    this.discount_dolar = response.discount_dolar;

				}
				this.dialog = dialog;
			} catch (error) {
				alertApp('error', 'alert', error.message);
			}

		},

        getSelectEmploye(employe_id) {
            this.employe_id = employe_id;
        },

        closeDialog() {
			this.$refs.form.reset();
			this.dialog = null;
		},

        cleanForm() {
            this.id = null;
            this.employe_id = null;
            this.payment_bs = null;
            this.payment_dolar = null;
            this.discount_bs = null;
            this.discount_dolar = null;
		},

        validate() {
			if (this.$refs.form.validate() && this.dialog == 'new')
				this.create();

			if (this.$refs.form.validate() && this.dialog == 'edit')
				this.update();

		},

        async create() {
			try {
                let response = await execute('create-payroll', {
                    employe_id: params.employe_id,
                    payment_bs: params.payment_bs,
                    payment_dolar: params.payment_dolar,
                    discount_bs: params.discount_bs,
                    discount_dolar: params.discount_dolar
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
                let response = await execute('update-payroll', {
                    id: this.id,
                    employe_id: params.employe_id,
                    payment_bs: params.payment_bs,
                    payment_dolar: params.payment_dolar,
                    discount_bs: params.discount_bs,
                    discount_dolar: params.discount_dolar
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
                let response = await execute('destroy-payroll', this.id);

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
            <span class="title">Eliminar Nomina?</span>
            </template>
            
            <template v-slot:dialog-content>
                <span class="headline">
                    Esta seguro de que desea este registro?
                </span>
            </template>
        </dialog-confirm>

        <!-- Dialogo para crear o actualizar recursos -->
        <dialog-base :active="dialog == 'new' || dialog == 'edit'" max-width="450">
            <template v-slot:dialog-title>
                <span class="title">{{ dialog == 'edit' ? 'Editar Nomina' : 'Nueva Nomina'}}</span>
            </template>

            <template v-slot:dialog-content>

                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>

                        <v-col cols="12">
                            <autocomplete-form 
                                uri="index-employes"
                                label="Selecciona un empleado"
                                column="name" 
                                itemValue="id" 
                                :defaultValue="employe_id"
                                :getSelect="getSelectEmploye" 
                            />
                        </v-col>

                        <v-col cols="12" class="mt-n2">
                            <v-text-field 
                                v-model="payment_bs" 
                                :rules="numberRule" 
                                type="number" 
                                label="Pagado en Bs" 
                                required
                                placeholder="Ingresa el monto pagado en Bolivares" 
                                suffix="BsS"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12" class="mt-n2">
                            <v-text-field 
                                v-model="payment_dolar" 
                                suffix="$" 
                                :rules="numberRule" 
                                type="number" 
                                label="Pagado en Dolares" 
                                required
                                placeholder="Ingresa el monto pagado en Dolares"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12"  class="mt-n2">
                            <v-text-field 
                                v-model="discount_bs" 
                                suffix="BsS" 
                                :rules="numberRule" 
                                type="number" 
                                label="Descontado en Bolivares" 
                                required
                                placeholder="Ingresa en Bolivares"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12" class="mt-n2">
                            <v-text-field 
                                v-model="discount_bs" 
                                suffix="$" 
                                :rules="numberRule" 
                                type="number" 
                                label="Descontado en Dolares" 
                                required
                                placeholder="Ingresa en Dolares"
                                ></v-text-field>
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