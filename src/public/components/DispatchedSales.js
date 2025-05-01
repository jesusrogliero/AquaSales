'use strict';
import "../utils/data-table.js";
import "../utils/dialog-base.js";
import "../utils/dialog-confirm.js";

export default Vue.component('dispatched-sales', {

    data: function () {
        return {
            id: null,
            sheet: false,

            headers: [
                { text: 'Nro Venta', value: 'id' },
                { text: 'Cliente', value: 'client' },
                { text: 'Total ($)', value: 'total_dolar' },
                { text: 'Total (BsS)', value: 'total_bs' },
                { text: 'Tapas (UNID)', value: 'total_caps' },
                { text: 'Unidades (UNID)', value: 'total_units' },
                { text: 'Despachado (UNID)', value: 'total_dispatched' },
                { text: 'Creado el', value: 'createdAt' },
                { text: 'Actualizado el', value: 'updatedAt' },
                { text: 'Acción', value: 'actions' },
            ],

            title: 'Lista de Ventas Despachadas',
            url: 'dispatched-sales',
            dialog: null,
            dialog2: null,
            valid: true,

            headers_items: [
                { text: 'Producto', value: 'product_name' },
                { text: 'Cantidad', value: 'units' },
                { text: 'Litros', value: 'liters' },
                { text: 'Tapa', value: 'caps' },
                { text: 'Total en BsS', value: 'total_bs' },
                { text: 'Total en $', value: 'total_dolar' }
            ],

            title_items: 'Articulos Despachados',
            url_items: 'index-items',
        };
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
        },

        closeDialog() {
            this.dialog = null;
        },

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