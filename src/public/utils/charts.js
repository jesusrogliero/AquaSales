'use strict';

export default Vue.component('charts', {

    props: ['labels', 'datasets', 'url', "id"],

    data: function () {
        return {

        };
    },

    mounted() {
        this.init();
    },

    methods: {


        init() {
            const ctx = document.getElementById(this.id);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.labels,
                    datasets: this.datasets
                    /*
                    labels: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Vienes', 'Sabado', 'Domingo'],
                    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                    datasets: [
                        {
                            label: 'Pago Movil',
                            data: [12, 19, 3, 5, 2, 3],
                            borderWidth: 1
                        },
                    ]
                    */
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },

    template: `
    <div>
        <canvas :id="id"></canvas>
    </div>
    `
});