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
                { text: 'Cliente', value: 'client' },
                { text: 'Total en $', value: 'total_dolar' },
                { text: 'Total en BsS', value: 'total_bs' },
                { text: 'Total Tapas', value: 'total_caps' },
                { text: 'Unidades', value: 'total_units' },
                { text: 'Total Despachado', value: 'total_dispatched' },
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
                { text: 'Total en $', value: 'total_dolar' },
                { text: 'Acción', value: 'actions' },
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

        closeDialog() {
            this.dialog = null;
        },

    },

    template: `
    <div>

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