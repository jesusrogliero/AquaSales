'use strict';
import "../utils/data-table.js";

export default Vue.component('payments', {

    data: function () {
        return {
            id: null,

            headers: [
                { text: 'Nro Venta', value: 'sale_id' },
                { text: 'Fecha de Pago', value: 'createdAt' },
                { text: 'Cliente', value: 'client' },
                { text: 'Pago Movil', value: 'mobile_payment' },
                { text: 'Referencia', value: 'reference' },
                { text: 'Efectivo Dolar', value: 'cash_dollar' },
                { text: 'Efectivo BsS', value: 'cash_bolivares' }
            ],

            title: 'Detalles de Pagos',
            url: 'index-payments',
            dialog: null,
            valid: true
        };
    },

    methods: {},

    template: `
    <div>
        <data-table 
            ref="dataTable"
            :url="url" 
            :headers="headers" 
            :title="title"
            :sortBy="['sale_id']"
            :sortDesc="[true]"
        ></data-table>
    </div>
    `
});