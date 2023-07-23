'use strict';
import "../utils/data-table.js";
import "../utils/dialog-base.js";
import "../utils/dialog-confirm.js";

export default Vue.component('sales', {

    data: function () {
        return {
            id: null,
            sheet: false,

            item_id: null,
            dispatch: null,
            item_pending_dispatch: null,

            headers: [
                { text: 'Cliente', value: 'client' },
                { text: 'Total en $', value: 'total_dolar' },
                { text: 'Total en BsS', value: 'total_bs' },
                { text: 'Total Tapas', value: 'total_caps' },
                { text: 'Unidades', value: 'total_units' },
                { text: 'Pendiente por Despachar', value: 'pending_dispatch' },
                { text: 'Total Despachado', value: 'total_dispatched' },
                { text: 'Creado el', value: 'createdAt' },
                { text: 'Acción', value: 'actions' },
            ],

            title: 'Ventas Pendientes por Despachar',
            url: 'sales-pending-dispatch',
            dialog: null,
            dialog2: null,
            valid: true,

            numberRule: [
                v => !!v || 'Este campo es requerido!!',
                v => /[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?/gm.test(v) || 'Verifique antes de continuar'
            ],

            headers_items: [
                { text: 'Producto', value: 'product_name' },
                { text: 'Cantidad', value: 'units' },
                { text: 'Pendiente por Despachar', value: 'pending_dispatch' },
                { text: 'Despachado', value: 'dispatched' },
                { text: 'Litros', value: 'liters' },
                { text: 'Tapa', value: 'caps' },
                { text: 'Total en BsS', value: 'total_bs' },
                { text: 'Total en $', value: 'total_dolar' },
                { text: 'Acción', value: 'actions' },
            ],

            title_items: 'Detalles de la Venta',
            url_items: 'index-items',
        };
    },

    watch: {
        async sheet() {
            if (this.sheet == false) {
                await this.$refs.dataTable_items.getData();
            }
        }
    },

    methods: {

        async openDialog(id, dialog) {
            try {
                this.dialog = null;

                if (id != null)
                    this.id = id;

                if (dialog === 'details') {
                    this.sheet = true;
                }

                this.dialog = dialog;
            } catch (error) {
                alertApp('error', 'alert', error.message);
            }
        },

        async openDialogItem(id, dialog) {
            try {
                this.dialog2 = null;

                if (id != null) {

                    let response = await execute('show-item', id);

                    if (response.code == 0) throw new Error(response.message);

                    this.item_id = id;
                    this.item_pending_dispatch = response.pending_dispatch;
                }

                this.dialog2 = dialog;
            } catch (error) {
                alertApp('error', 'alert', error.message);
            }
        },

        closeDialog() {
            this.dialog = null;
        },

        validate() {

            if (this.$refs.form.validate() && this.dialog2 == 'edit') {
                this.updateItem();
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
                await this.$refs.dataTable_items.getData();

            } catch (error) {
                alertApp({ color: "error", icon: "alert", text: error.message });
            } finally {
                this.dispatch = null;
                this.item_id = null;
                this.dialog2 = null;
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

        <!-- Dialogo para crear o actualizar recursos -->
        <dialog-base v-if="id != null" :active="dialog2 == 'edit'">
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

                <v-btn @click="dialog2 = null" color="transparent" text style="color: #f44336 !important;">
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
        ></data-table>



        <div v-if="dialog == 'details' && id != null">
            <v-bottom-sheet v-model="sheet" >
                <v-sheet v-if="sheet" class="text-center" height="400px">

                    <data-table 
                        ref="dataTable_items"
                        :url="url_items" 
                        :headers="headers_items" 
                        :title="title_items"
                        :sale_id="id"
                        :update="openDialogItem"
                    ></data-table>

                </v-sheet>
            </v-bottom-sheet>
	    </div>
    </div>
    `
});