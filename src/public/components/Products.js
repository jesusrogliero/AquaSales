'use strict';
import "../utils/data-table.js";
import "../utils/dialog-base.js";
import "../utils/dialog-confirm.js";

export default Vue.component('products', {
    
    data: function () {
        return {
            id: null,
            name: null,
            quantity: null,
            liters: null,
            price: null,
            cap: null,
            is_dolar: false,
            is_combo: false,
            is_active: false,
            is_caps: false,

            requiredRule: [v => !!v || 'Este campo es requerido!!'],
			numberRule: [
				v => !!v || 'Este campo es requerido!!',
				v => /[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?/gm.test(v) || 'Verifique antes de continuar'
			],


            headers: [
                { text: 'Nombre', value: 'name' },
                { text: 'Cantidad de Recargas', value: 'quantity' },
                { text: 'Precio en $', value: 'price_dolar' },
                { text: 'Precio en BsS', value: 'price_bs' },
                { text: 'Cantidad de Tapas', value: 'cap' },
                { text: 'Litros', value: 'liters' },
                { text: 'Activo', value: 'is_active' },
                { text: '¿Es una Tapa?', value: 'is_caps' },
                { text: 'Acción', value: 'actions' },
              ],

              title: 'Gestión De Recargas',
              url: 'index-products',
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

					this.id = response.id;
					this.name = response.name;
					this.liters = response.liters;
					this.quantity = response.quantity;
                    this.cap = response.cap;
                    this.is_dolar = response.is_dolar;
                    this.is_combo = response.is_combo;
                    this.is_active = response.is_active;
                    this.is_caps = response.is_caps;

                    this.price = response.price_bs;
                    if(response.is_dolar) {
                        this.price = response.price_dolar;
                    }
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
			this.id = null;
			this.name = null;
			this.liters = null;
			this.quantity = null;
            this.price = null;
			this.dialog = null;
            this.cap = null;
            this.is_dolar = false;
            this.is_combo = false;
            this.is_active = false;
            this.is_caps = false;
		},

        validate() {
			if (this.$refs.form.validate() && this.dialog == 'new')
				this.create();

			if (this.$refs.form.validate() && this.dialog == 'edit')
				this.update();

		},

        async create() {
			try {
                let response = await execute('create-product', {
                    name: this.name,
                    liters: this.liters,
                    quantity: this.quantity,
                    price: this.price,
                    cap: this.cap,
                    is_dolar: this.is_dolar,
                    is_combo: this.is_combo,
                    is_active: this.is_active,
                    is_caps: this.is_caps
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
                let response = await execute('update-product', {
                    id: this.id,
                    name: this.name,
                    liters: this.liters,
                    quantity: this.quantity,
                    price: this.price,
                    cap: this.cap,
                    is_dolar: this.is_dolar,
                    is_combo: this.is_combo,
                    is_active: this.is_active,
                    is_caps: this.is_caps
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
                let response = await execute('destroy-product', this.id);

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
            <span class="title">Eliminar Producto?</span>
            </template>
            
            <template v-slot:dialog-content>
                <span class="headline">
                    Esta seguro de que desea eliminar este Producto?
                </span>
            </template>
        </dialog-confirm>

        <!-- Dialogo para crear o actualizar recursos -->
        <dialog-base :active="dialog == 'new' || dialog == 'edit'">
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
                            <v-text-field v-model="liters" :rules="numberRule" type="number" label="Litros" required
                                placeholder="Ingresa el volumen de la botella" suffix="Lt"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-text-field v-model="quantity" suffix="UNID" :rules="numberRule" type="number" label="Cantidad de Recargas" required
                                placeholder="Ingresa la cantidad de recargas"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
            
                            <v-text-field 
                                v-model="price" 
                                :suffix="is_dolar ? '$' : 'BsS'"
                                :rules="numberRule"
                                type="number"
                                label="Precio"
                                required
                                placeholder="Ingresa el precio"
                                @click:append="is_dolar = !is_dolar"
                                append-icon="mdi-repeat"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                        <v-text-field v-model="cap" suffix="UNID" type="number" label="Cantidad de Tapas" required
                            placeholder="Ingresa la cantidad de tapas"></v-text-field>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-switch v-model="is_combo" label="Es un Combo" ></v-switch>
                        </v-col>

                        <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-switch v-model="is_active" label="Productos Para la Venta?" ></v-switch>
                        </v-col>

                     <v-col cols="12" lg="6" md="6" sm="6"  class="mt-2">
                            <v-switch v-model="is_caps" label="¿Es una Tapa?" ></v-switch>
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
            itemsPerPage="15"
        ></data-table>
    </div>
    `
});