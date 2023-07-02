'use strict';
import "../utils/data-table.js";

export default Vue.component('payments', {

    data: function () {
        return {
            id: null,

            headers: [
                { text: 'Pago Movil', value: 'mobile_payment' },
                { text: 'Efectivo Dolar', value: 'cash_dollar' },
                { text: 'Efectivo BsS', value: 'cash_bolivares' },
                { text: 'Creado el', value: 'createdAt' },
                { text: 'Actualizado el', value: 'updatedAt' },
                { text: 'Acción', value: 'actions' },
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
        ></data-table>
    </div>
    `
});