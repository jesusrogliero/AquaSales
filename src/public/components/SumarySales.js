'use strict';
import "../utils/data-table.js";

export default Vue.component('report-sumary', {

	data: function () {
		return {
			headers: [
				{ text: 'Fecha', value: 'createdAt' },
				{ text: 'Pago Movil', value: 'mobile_payment' },
				{ text: 'Dolares en Efectivo', value: 'cash_dollar' },
				{ text: 'Bolivares en Efectivo', value: 'cash_bolivares' },
				{ text: 'Unidades Vendidas', value: 'sales_units' },
				{ text: 'Litros Despachados', value: 'liters_consumption' },
				{ text: 'Tapas Vendidas', value: 'total_caps' }
			],
			title: 'Reporte de Ventas',
			url: 'sumary-range-date',
			dates: [],
			menu: false
		};
	},

	watch: {
		dates: async function() {
			await this.$refs.dataTable.getData();
		}
	},

	template: `
  
    <data-table 
        ref="dataTable"
        :url="url" 
        :headers="headers" 
        :title="title"
		:sale_id="dates"
    >
    	<template v-slot:toolbar>
			<v-row class="mt-2" justify="end">
				<v-col cols="3">
					<v-menu
						ref="menu"
						v-model="menu"
						:close-on-content-click="false"
						:return-value.sync="date"
						transition="scale-transition"
						offset-y
						min-width="auto"
					>
						<template v-slot:activator="{ on, attrs }">
				
							<v-text-field
								v-model="dates[0]"
								label="Desde"
								prepend-icon="mdi-calendar"
								readonly
								v-bind="attrs"
								v-on="on"
							></v-text-field>
						</template>

						<v-date-picker v-model="dates[0]" no-title scrollable >
							<v-spacer></v-spacer>
							<v-btn text color="primary" @click="menu = false">
								Cancel
							</v-btn>

							<v-btn text color="primary" @click="$refs.menu.save(dates[0])">
								OK
							</v-btn>

						</v-date-picker>
					</v-menu>
				</v-col>

				<v-col cols="3">
					<v-menu
					ref="menu1"
					v-model="menu1"
					:close-on-content-click="false"
					:return-value.sync="date"
					transition="scale-transition"
					offset-y
					min-width="auto"
					>
					<template v-slot:activator="{ on, attrs }">
				
						<v-text-field
							v-model="dates[1]"
							label="Hasta"
							prepend-icon="mdi-calendar"
							readonly
							v-bind="attrs"
							v-on="on"
							></v-text-field>
					</template>

					<v-date-picker v-model="dates[1]" no-title scrollable >
							<v-spacer></v-spacer>
						<v-btn text color="primary" @click="menu1 = false">
							Cancel
						</v-btn>

						<v-btn text color="primary" @click="$refs.menu1.save(dates[1])">
							OK
						</v-btn>

					</v-date-picker>
					</v-menu>
				</v-col>
			</v-row>
      	</template>
        
    </data-table>
    `
});

