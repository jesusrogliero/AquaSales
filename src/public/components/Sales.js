'use strict';
import "../utils/data-table.js";
import "../utils/dialog-base.js";
import "../utils/dialog-confirm.js";

export default Vue.component('sales', {

    data: function () {
        return {
            headers: [
                { text: 'Nro Venta', value: 'id' },
                { text: 'Cliente', value: 'client' },
                { text: 'Pendiente por Despachar (UNID)', value: 'pending_dispatch' },
                { text: 'Actualizado', value: 'updatedAt' },
                { text: 'Acción', value: 'actions' },
            ],

            id: null,
            items: [],
            title: 'Recargas Pendientes',
            url: 'sales-pending-dispatch',
            dialog: null,
            dialog2: null,
            valid: true,
            dispatchQuantities: {},

            numberRule: [
                v => !!v || 'Este campo es requerido!!',
                v => /[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?/gm.test(v) || 'Verifique antes de continuar'
            ],
        };
    },

    methods: {

        async openDialog(id, dialog) {
            try {
                this.dialog = null;

                if (id != null)
                    this.id = id;

                if (dialog === 'details') {
                    if (id != null) {

                        let response = await execute('index-items', id);

                        if (response.code == 0) throw new Error(response.message);
                        
                        this.items = response;
                        // Inicializar cantidades a despachar
                        this.dispatchQuantities = {};
                        response.forEach(item => {
                            this.$set(this.dispatchQuantities, item.id, 0);
                        });
                    }
                }

                this.dialog = dialog;
            } catch (error) {
                alertApp('error', 'alert', error.message);
            }
        },

        // Métodos para incrementar/decrementar cantidades
        increment(itemId, maxValue) {
            if (this.dispatchQuantities[itemId] < maxValue) {
                this.$set(this.dispatchQuantities, itemId, this.dispatchQuantities[itemId] + 1);
            }
        },

        decrement(itemId) {
            if (this.dispatchQuantities[itemId] > 0) {
                this.$set(this.dispatchQuantities, itemId, this.dispatchQuantities[itemId] - 1);
            }
        },

        setMax(itemId, maxValue) {
            this.$set(this.dispatchQuantities, itemId, maxValue);
        },

        closeDialog() {
            this.dialog = null;
            this.dispatchQuantities = {};
        },

        validate() {
            if (this.$refs.form.validate() && this.dialog == 'details') {
                this.updateItem();
            }
        },

        async updateItem() {
            try {
                // Filtrar solo los items con cantidad > 0
                const itemsToDispatch = Object.entries(this.dispatchQuantities)
                    .filter(([id, qty]) => qty > 0)
                    .map(([id, qty]) => ({ id: parseInt(id), quantity: qty }));

                if (itemsToDispatch.length === 0) {
                    throw new Error('Debe seleccionar al menos un producto para despachar');
                }

                // Iterar sobre cada item y llamar al endpoint individualmente
                for (const item of itemsToDispatch) {
                    let response = await execute('dispatch-item', {
                        id: item.id,
                        dispatch: item.quantity
                    });

                    if (response.code == 0) {
                        throw new Error(response.message);
                    }
                }

                alertApp({ color: "success", icon: "check", text: "Productos despachados exitosamente" });
                await this.$refs.dataTable.getData();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.closeDialog();
            }
        },

        async destroy() {
            try {
                let response = await execute('destroy-sale', this.id);

                if (response.code == 0)
                    throw new Error(response.message);

                alertApp({ color: "success", icon: "check", text: response.message });
                await this.$refs.dataTable.getData();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.dialog = null;
            }
        }

    },

    template: `
    <div>

        <!-- Dialogo de confirmacion antes de eliminar -->
        <dialog-confirm :active="dialog == 'delete'" :confirm="destroy" :cancel="closeDialog">
            
            <template v-slot:dialog-title>
            <span class="title">Eliminar Esta Venta?</span>
            </template>
            
            <template v-slot:dialog-content>
                <span class="headline">
                    Esta seguro de que desea eliminar esta Venta?
                </span>
            </template>
        </dialog-confirm>


        <!-- Dialogo para despachar productos -->
        <dialog-base v-if="id != null" :active="dialog == 'details'">
            <template v-slot:dialog-title>
                <span class="title">Cuantos botellones recargaste?</span>
            </template>

            <template v-slot:dialog-content>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12" v-for="item in items" :key="item.id" v-if="item.pending_dispatch > 0">
                            <v-card outlined class="pa-4 mb-3 mt-4">
                                <v-row align="center">
                                    <v-col cols="12" sm="5" class="mb-2 mb-sm-0">
                                        <div class="subtitle-1 font-weight-bold mb-1">{{ item.product_name }}</div>
                                        <div class="caption text--secondary">Pendiente: {{ item.pending_dispatch }} unidades</div>
                                    </v-col>
                                    
                                    <v-col cols="12" sm="5" class="mb-2 mb-sm-0">
                                        <v-row align="center" justify="center" no-gutters>
                                            <v-btn 
                                                icon 
                                                color="primary" 
                                                @click="decrement(item.id)"
                                                :disabled="dispatchQuantities[item.id] === 0"
                                            >
                                                <v-icon>mdi-minus</v-icon>
                                            </v-btn>
                                            
                                            <v-text-field
                                                v-model.number="dispatchQuantities[item.id]"
                                                type="number"
                                                :max="item.pending_dispatch"
                                                :min="0"
                                                hide-details
                                                outlined
                                                dense
                                                class="mx-2"
                                                style="max-width: 100px;"
                                            ></v-text-field>
                                            
                                            <v-btn 
                                                icon 
                                                color="primary" 
                                                @click="increment(item.id, item.pending_dispatch)"
                                                :disabled="dispatchQuantities[item.id] >= item.pending_dispatch"
                                                class="mx-1"
                                            >
                                                <v-icon>mdi-plus</v-icon>
                                            </v-btn>
                                        </v-row>
                                    </v-col>
                                    
                                    <v-col cols="12" sm="2" class="text-center">
                                        <v-btn 
                                            small 
                                            outlined 
                                            color="success" 
                                            @click="setMax(item.id, item.pending_dispatch)"
                                        >
                                            Todo
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-form>
            </template>

            <template v-slot:dialog-actions>
                <v-btn :disabled="!valid" color="transparent" text style="color:#2c823c !important;" class="mr-4"
                    @click="validate">
                    <span>Despachar</span>
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
            :destroy="openDialog"
            :details="openDialog"
            :sortBy="['id']"
            :sortDesc="[true]"
        ></data-table>

    </div>
    `
});