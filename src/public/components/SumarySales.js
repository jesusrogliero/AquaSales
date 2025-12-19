'use strict';
import "../utils/data-table.js";
import "../utils/charts.js";

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
			menu: false,
			// URLs de los endpoints para las gráficas
			chart1Url: 'most-sold-products',
			chart2Url: 'units-dispatched',
			chart3Url: 'sumary-range-date',
			// Datos para las gráficas
			chart1Data: [],
			chart2Data: [],
			chart3Data: [],
			// Títulos de las gráficas
			chart1Title: 'Productos Más Vendidos',
			chart2Title: 'Unidades Despachadas',
			chart3Title: 'Resumen de Ventas (Monetario)',
			chartsKey: 0,
			loadingCharts: false
		};
	},

	watch: {
		dates: {
			handler: async function(newDates, oldDates) {
				// Solo ejecutar si los arrays son diferentes
				if (JSON.stringify(newDates) === JSON.stringify(oldDates)) {
					return;
				}
				
				// Ordenar las fechas automáticamente
				if (this.dates.length === 2 && this.dates[0] > this.dates[1]) {
					this.dates = [this.dates[1], this.dates[0]];
					return; // Evitar llamada duplicada
				}
				
				// Cargar datos si hay al menos una fecha seleccionada
				if (this.dates.length > 0) {
					if (this.$refs.dataTable) {
						await this.$refs.dataTable.getData();
					}
					await this.loadAllCharts();
				}
			},
			deep: true,
			immediate: false
		}
	},

	async mounted() {
		// Cargar las gráficas al montar el componente si hay al menos una fecha
		if (this.dates.length > 0) {
			await this.loadAllCharts();
		}
	},

	computed: {
		// Formatear las fechas para mostrar en el input
		datesFormatted() {
			if (this.dates.length === 0) {
				return '';
			} else if (this.dates.length === 1) {
				return `Fecha: ${this.dates[0]}`;
			} else {
				// Ordenar las fechas
				const sortedDates = [...this.dates].sort();
				return `Desde: ${sortedDates[0]} - Hasta: ${sortedDates[1]}`;
			}
		}
	},

	methods: {
		// Handler para el cambio de fechas
		async onDateChange() {
			// Esperar un momento para que Vue actualice el modelo
			await this.$nextTick();
			
			// Cargar datos si hay al menos una fecha seleccionada
			if (this.dates.length > 0) {
				// Ordenar las fechas si es necesario
				if (this.dates.length === 2 && this.dates[0] > this.dates[1]) {
					this.dates = [this.dates[1], this.dates[0]];
				}
				
				// Cargar tabla y gráficas
				if (this.$refs.dataTable) {
					await this.$refs.dataTable.getData();
				}
				await this.loadAllCharts();
			}
			
			// Cerrar el menú cuando se completa el rango (2 fechas)
			if (this.dates.length === 2) {
				this.menu = false;
			}
		},

		// Cargar datos de todas las gráficas
		async loadAllCharts() {
			this.loadingCharts = true;
			try {
				await Promise.all([
					this.loadChart1Data(),
					this.loadChart2Data(),
					this.loadChart3Data()
				]);
				this.chartsKey++;
			} catch (error) {
				alertApp({color:"error", text: "Error al cargar las gráficas: " + error.message, icon: "alert"});
			} finally {
				this.loadingCharts = false;
			}
		},

		// Cargar datos de la gráfica 1 - Productos más vendidos
		async loadChart1Data() {
			try {
				let data = await execute(this.chart1Url, this.dates);
				if (data.code == 0) {
					throw new Error(data.message);
				}
				this.chart1Data = data;
			} catch (error) {
				console.error('Error al cargar gráfica 1:', error);
				this.chart1Data = [];
			}
		},

		// Cargar datos de la gráfica 2 - Unidades despachadas
		async loadChart2Data() {
			try {
				let data = await execute(this.chart2Url, this.dates);
				if (data.code == 0) {
					throw new Error(data.message);
				}
				this.chart2Data = data;
			} catch (error) {
				console.error('Error al cargar gráfica 2:', error);
				this.chart2Data = [];
			}
		},

		// Cargar datos de la gráfica 3 - Resumen de ventas
		async loadChart3Data() {
			try {
				let data = await execute(this.chart3Url, this.dates);
				if (data.code == 0) {
					throw new Error(data.message);
				}
				this.chart3Data = data;
			} catch (error) {
				console.error('Error al cargar gráfica 3:', error);
				this.chart3Data = [];
			}
		},

		// Gráfica 1: Labels de productos
		getChart1Labels() {
			return this.chart1Data.map(item => item.product_name);
		},

		// Gráfica 1: Dataset de cantidad vendida
		getChart1Dataset() {
			return [{
				label: 'Cantidad Vendida',
				data: this.chart1Data.map(item => item.quantity_sold),
				backgroundColor: '#2196F3',
				borderColor: '#2196F3',
				borderWidth: 1
			}];
		},

		// Gráfica 2: Labels de fechas
		getChart2Labels() {
			return this.chart2Data.map(item => item.fecha);
		},

		// Gráfica 2: Dataset de unidades despachadas
		getChart2Dataset() {
			return [{
				label: 'Unidades Despachadas',
				data: this.chart2Data.map(item => item.total_units_dispatched),
				backgroundColor: '#4CAF50',
				borderColor: '#4CAF50',
				borderWidth: 1
			}];
		},

		// Gráfica 3: Labels de fechas
		getChart3Labels() {
			return this.chart3Data.map(item => item.createdAt);
		},

		// Gráfica 3: Múltiples datasets con todas las métricas monetarias
		getChart3Dataset() {
			const monetaryMetrics = [
				{ label: 'Pago Móvil (BsS)', value: 'mobile_payment', color: '#2196F3' },
				{ label: 'Dólares ($)', value: 'cash_dollar', color: '#4CAF50' },
				{ label: 'Bolívares (BsS)', value: 'cash_bolivares', color: '#FF9800' }
			];

			return monetaryMetrics.map(metric => ({
				label: metric.label,
				data: this.chart3Data.map(item => {
					const value = item[metric.value];
					// Remover el sufijo de la unidad si existe
					if (typeof value === 'string') {
						return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
					}
					return value || 0;
				}),
				backgroundColor: metric.color,
				borderColor: metric.color,
				borderWidth: 1
			}));
		}
	},

	template: `
    <v-container fluid>
		<!-- Sección de Gráficas -->
		<v-card class="mb-4">
			<v-card-title>
				Gráficas de Resumen
				<v-spacer></v-spacer>
				<v-progress-circular
					v-if="loadingCharts"
					indeterminate
					color="primary"
					size="24"
				></v-progress-circular>
			</v-card-title>
			<v-card-text>
				<v-row>
					<!-- Gráfica 1: Productos Más Vendidos -->
					<v-col cols="12" md="4">
						<h3 class="mb-2">{{ chart1Title }}</h3>
						<div v-if="loadingCharts" class="text-center py-4">
							<v-progress-circular indeterminate color="primary"></v-progress-circular>
						</div>
						<charts 
							v-else-if="chart1Data.length > 0"
							:key="'chart1-' + chartsKey"
							:id="'chart1'"
							:labels="getChart1Labels()"
							:datasets="getChart1Dataset()"
						/>
						<v-alert v-else type="info" outlined>
							Selecciona un rango de fechas para ver la gráfica
						</v-alert>
					</v-col>

					<!-- Gráfica 2: Unidades Despachadas -->
					<v-col cols="12" md="4">
						<h3 class="mb-2">{{ chart2Title }}</h3>
						<div v-if="loadingCharts" class="text-center py-4">
							<v-progress-circular indeterminate color="primary"></v-progress-circular>
						</div>
						<charts 
							v-else-if="chart2Data.length > 0"
							:key="'chart2-' + chartsKey"
							:id="'chart2'"
							:labels="getChart2Labels()"
							:datasets="getChart2Dataset()"
						/>
						<v-alert v-else type="info" outlined>
							Selecciona un rango de fechas para ver la gráfica
						</v-alert>
					</v-col>

					<!-- Gráfica 3: Resumen de Ventas (Configurable) -->
					<v-col cols="12" md="4">
						<h3 class="mb-2">{{ chart3Title }}</h3>
						<div v-if="loadingCharts" class="text-center py-4">
							<v-progress-circular indeterminate color="primary"></v-progress-circular>
						</div>
						<charts 
							v-else-if="chart3Data.length > 0"
							:key="'chart3-' + chartsKey"
							:id="'chart3'"
							:labels="getChart3Labels()"
							:datasets="getChart3Dataset()"
						/>
						<v-alert v-else type="info" outlined>
							Selecciona un rango de fechas para ver la gráfica
						</v-alert>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<!-- Tabla de Datos -->
		<data-table 
			ref="dataTable"
			:url="url" 
			:headers="headers" 
			:title="title"
			:sale_id="dates"
		>
			<template v-slot:toolbar>
				<v-row class="mt-2" justify="end">
			<v-col cols="12" sm="8" md="6">
					<v-menu
					v-model="menu"
					:close-on-content-click="false"
						transition="scale-transition"
						offset-y
						min-width="auto"
					>
						<template v-slot:activator="{ on, attrs }">
							<v-text-field
								:value="datesFormatted"
								label="Seleccionar Rango de Fechas"
								prepend-icon="mdi-calendar-range"
								readonly
								v-bind="attrs"
								v-on="on"
								outlined
								dense
							></v-text-field>
						</template>

						<v-date-picker 
							v-model="dates" 
							range 
							no-title 
							scrollable
							@input="onDateChange"
						>
						</v-date-picker>
			</v-menu>
		</v-col>
    `
});

