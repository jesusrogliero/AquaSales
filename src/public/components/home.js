'use strict'
import './AdminAutenticate.js';

// componente home
let Home = Vue.component('Home', {

	data: function () {
		return {
			loading: false,
			details: true,

			today_sales: {},
			lastweek_sales: {},
			lastmonth_sales: {},

			icomes: {},

			pending_dispatch: null,

			today_liters_consumption: null,
			lastweek_liters_consumption: null,
			lastmonth_liters_consumption: null,

			variacionToday: {},
			variacionWeek: {},
			variacionMounth: {},

			bcv: 0,
			mensaje: '',

			formatNumber: window.formatNumber
		};
	},

	async mounted() {
		this.saludar();
		await this.getMetricsIcomes();
		await this.getMetricsTotal();
		await this.getLitersDispatch();
		await this.getPendingDispatch();
		await this.getVariacion();
		await this.getBcv();
	},

	methods: {

		saludar() {
			const hora = new Date().getHours();
			this.mensaje = hora < 12 ? '¡Buenos días!' : hora < 18 ? '¡Buenas tardes!' : '¡Buenas noches!';
		},

		toNewSale() { this.$router.push('/new_sale'); },
		toReport() { this.$router.push('/report_sumary'); },

		empty(num) {
			if (num == NaN || num == undefined || num == null) {
				return 0;
			}
			return num;
		},

		async getBcv() {
			try {
				let response = await execute('show-bcv');

				if (response.code === 0) {
					throw new Error(response.message)
				}
				this.bcv = response;
			} catch (error) {
				alertApp({ color: "error", icon: "alert", text: error.message });
			}

		},

		async getPendingDispatch() {
			try {
				let response = await execute('pending-dispatch');

				if (response.code === 0) {
					throw new Error(response.message)
				}
				this.pending_dispatch = response.pending_dispatch;
			} catch (error) {
				alertApp({ color: "error", icon: "alert", text: error.message });
			}

		},

		async sumeryReportPdf(period) {
			try {
				let response = await execute('sumary-report', period);

				if (response.code === 0) {
					throw new Error(response.message)
				}

				alertApp({ color: "success", icon: "check", text: response.message });

			} catch (error) {
				alertApp({ color: "error", icon: "alert", text: error.message });
			}

		},

		async getLitersDispatch() {
			try {
				let response = await execute('liters-dispatch');

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.today_liters_consumption = response.today_liters_consumption;
				this.lastweek_liters_consumption = response.lastweek_liters_consumption;
				this.lastmonth_liters_consumption = response.lastmonth_liters_consumption;
			} catch (error) {
				alertApp({ color: "error", icon: "alert", text: error.message });
			}

		},

		async getMetricsTotal() {
			try {
				const { sale_today, sale_week, sale_mounth } = await execute('total-sales');
				const { previous_sales, previous_week, previous_month } = await execute('previous-sales');

				this.today_sales = {
					bs: parseFloat(this.empty(sale_today.today_sales_bs)).toFixed(2),
					dolar: parseFloat(this.empty(sale_today.today_sales_dolar)).toFixed(2),
					units: sale_today.today_sales_units,
					previous_units: previous_sales
				};

				this.lastweek_sales = {
					bs: parseFloat(this.empty(sale_week.lastweek_sales_bs)).toFixed(2),
					dolar: parseFloat(this.empty(sale_week.lastweek_sales_dolar)).toFixed(2),
					units: sale_week.lastweek_sales_units,
					previous_units: previous_week
				};

				this.lastmonth_sales = {
					bs: parseFloat(this.empty(sale_mounth.lastmonth_sales_bs)).toFixed(2),
					dolar: parseFloat(this.empty(sale_mounth.lastmonth_sales_dolar)).toFixed(2),
					units: sale_mounth.lastmonth_sales_units,
					previous_units: previous_month
				};

			} catch (error) {
				alertApp({ color: "error", icon: "alert", text: error.message });
			}
		},

		async getMetricsIcomes() {
			try {
				let response = await execute('icomes-metrics');

				if (response.code === 0) {
					throw new Error(response.message)
				}
				
				this.icomes = response;

			} catch (error) {
				alertApp({ color: "error", icon: "alert", text: error.message });
			}
		},

		async getVariacion() {
			this.variacionToday = await execute('variacion-sales');
			this.variacionWeek = await execute('variacion-sales', 'WEEK');
			this.variacionMounth = await execute('variacion-sales', 'MOUNTH');
		}
	},

	template: `
		<div>

			<v-container class="pa-3 mb-3" fluid style="background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%); border-radius: 8px;">
				<v-row align="center" no-gutters>
					<v-col cols="12" lg="6" md="12" sm="12" class="mb-2 mb-lg-0">
						<div class="d-flex align-center flex-wrap" style="gap: 8px;">
							<v-chip 
								color="blue darken-2" 
								label 
								dark
								style="font-weight: 600; padding: 18px 14px; border-radius: 8px; box-shadow: 0 2px 8px rgba(25, 118, 210, 0.25);">
								<v-icon left size="20">mdi-briefcase-account</v-icon>
								{{mensaje}}
							</v-chip>
							
							<v-chip 
								color="blue darken-1" 
								label 
								outlined
								style="font-weight: 600; padding: 18px 14px; border-radius: 8px; border-width: 2px; background: white;">
								<v-icon left size="20" color="blue darken-2">mdi-cash-multiple</v-icon>
								BCV: {{bcv}} BsS
							</v-chip>
							
							<v-chip 
								:color="pending_dispatch > 0 ? 'blue darken-3' : 'blue-grey lighten-2'" 
								label 
								:dark="pending_dispatch > 0"
								:outlined="pending_dispatch === 0"
								style="font-weight: 600; padding: 18px 14px; border-radius: 8px; border-width: 2px;">
								<v-icon left size="20">mdi-truck-delivery</v-icon>
								Despachos Pendientes: {{pending_dispatch}}
							</v-chip>
						</div>
					</v-col>	
					
					<v-spacer/>

					<v-col cols="12" lg="auto" md="12" sm="12">
						<div class="d-flex align-center justify-end flex-wrap" style="gap: 8px;">
							<v-btn 
								color="blue darken-1" 
								@click="details=!details" 
								rounded 
								elevation="2"
								dark
								small
								class="text-none"
								style="font-weight: 600;">
								<v-icon left size="18">{{details ? 'mdi-chart-box' : 'mdi-currency-usd'}}</v-icon>
								<span v-if="details">Totales</span> 
								<span v-else>Detalles</span>  
							</v-btn>

							<v-btn 
								color="blue darken-2" 
								@click="toNewSale"
								rounded 
								elevation="2"
								dark
								small
								class="text-none"
								style="font-weight: 600;">
								<v-icon left size="18">mdi-cart-plus</v-icon>
								<span>Nueva Venta</span>  
							</v-btn>

							<v-btn 
								color="blue-grey darken-1" 
								@click="toReport"
								rounded 
								elevation="2"
								dark
								small
								class="text-none"
								style="font-weight: 600;">
								<v-icon left size="18">mdi-file-document-multiple</v-icon>
								<span>Reportes</span>  
							</v-btn>

							<admin-autenticate/>
						</div>
					</v-col>
			
				</v-row>
			</v-container>
		
			<div class="mx-2">
				<v-row>
					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); transition: all 0.3s;">
							<v-card-title class="white--text d-flex align-center justify-space-between pb-2">
								<div>
									<v-icon color="white" size="28" class="mr-2">mdi-calendar-today</v-icon>
									<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">INGRESOS HOY</span>
								</div>
								<v-btn icon small @click="sumeryReportPdf('TODAY')" class="hover-icon">
									<v-icon color="white">mdi-whatsapp</v-icon>
								</v-btn>
							</v-card-title>
							<v-card-text class="white--text pt-4">
								<v-row v-if="details" dense>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Pago Móvil</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.today_icomes.mobile_payment_icome == null ? 0 : formatNumber(icomes.today_icomes.mobile_payment_icome) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Efectivo BsS</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.today_icomes.cash_bolivares_icome == null ? 0 : formatNumber(icomes.today_icomes.cash_bolivares_icome) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Efectivo USD</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.today_icomes.cash_dollar_icome == null ? 0 : formatNumber(icomes.today_icomes.cash_dollar_icome) }} $
											</span>
										</div>
									</v-col>
								</v-row>

								<v-row v-else dense>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Total BsS</span>
											<span style="font-size: 24px; font-weight: 700;">
												{{today_sales.bs == null ? 0 : today_sales.bs }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4 my-2"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Total USD</span>
											<span style="font-size: 24px; font-weight: 700;">
												{{today_sales.dolar == null ? 0 : today_sales.dolar }} $
											</span>
										</div>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #2b5876 0%, #4e89ae 100%); transition: all 0.3s;">
							<v-card-title class="white--text d-flex align-center justify-space-between pb-2">
								<div>
									<v-icon color="white" size="28" class="mr-2">mdi-calendar-week</v-icon>
									<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">INGRESOS ESTA SEMANA</span>
								</div>
								<v-btn icon small @click="sumeryReportPdf('WEEK')" class="hover-icon">
									<v-icon color="white">mdi-whatsapp</v-icon>
								</v-btn>
							</v-card-title>

							<v-card-text class="white--text pt-4">
								<v-row v-if="details" dense>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Pago Móvil</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.week_icome.mobile_payment_icome == null ? 0 : formatNumber(icomes.week_icome.mobile_payment_icome) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Efectivo BsS</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.week_icome.cash_bolivares_icome == null ? 0 : formatNumber(icomes.week_icome.cash_bolivares_icome) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Efectivo USD</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.week_icome.cash_dollar_icome == null ? 0 : formatNumber(icomes.week_icome.cash_dollar_icome) }} $
											</span>
										</div>
									</v-col>
								</v-row>

								<v-row v-else dense>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Total BsS</span>
											<span style="font-size: 24px; font-weight: 700;">
												{{lastweek_sales.bs == null ? 0 : formatNumber(lastweek_sales.bs) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4 my-2"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Total USD</span>
											<span style="font-size: 24px; font-weight: 700;">
												{{lastweek_sales.dolar == null ? 0 : formatNumber(lastweek_sales.dolar) }} $
											</span>
										</div>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%); transition: all 0.3s;">
							<v-card-title class="white--text d-flex align-center justify-space-between pb-2">
								<div>
									<v-icon color="white" size="28" class="mr-2">mdi-calendar-month</v-icon>
									<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">INGRESOS ESTE MES</span>
								</div>
								<v-btn icon small @click="sumeryReportPdf('MOUNTH')" class="hover-icon">
									<v-icon color="white">mdi-whatsapp</v-icon>
								</v-btn>
							</v-card-title>
							<v-card-text class="white--text pt-4">
								<v-row v-if="details" dense>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Pago Móvil</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.month_icome.mobile_payment_icome == null ? 0 : formatNumber(icomes.month_icome.mobile_payment_icome) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Efectivo BsS</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.month_icome.cash_bolivares_icome == null ? 0 : formatNumber(icomes.month_icome.cash_bolivares_icome) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Efectivo USD</span>
											<span style="font-size: 20px; font-weight: 600;">
												{{icomes.month_icome.cash_dollar_icome == null ? 0 : formatNumber(icomes.month_icome.cash_dollar_icome) }} $
											</span>
										</div>
									</v-col>
								</v-row>

								<v-row v-else dense>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Total BsS</span>
											<span style="font-size: 24px; font-weight: 700;">
												{{lastmonth_sales.bs == null ? 0 : formatNumber( lastmonth_sales.bs ) }} BsS
											</span>
										</div>
									</v-col>
									<v-divider dark class="mx-4 my-2"></v-divider>
									<v-col cols="12" class="py-2">
										<div class="d-flex align-center justify-space-between">
											<span style="font-size: 13px; opacity: 0.9;">Total USD</span>
											<span style="font-size: 24px; font-weight: 700;">
												{{lastmonth_sales.dolar == null ? 0 : formatNumber( lastmonth_sales.dolar ) }} $
											</span>
										</div>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #1e5f8d 0%, #2e8bb9 100%); transition: all 0.3s;">
							<v-card-title class="white--text pb-2">
								<v-icon color="white" size="28" class="mr-2">mdi-water</v-icon>
								<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">DESPACHADO HOY</span>
							</v-card-title>
							<v-card-text class="white--text">
								<v-row align="center" justify="space-between">
									<v-col cols="7">
										<div style="font-size: 42px; font-weight: 700; line-height: 1;">
											{{today_liters_consumption == null ? 0 : today_liters_consumption }}
										</div>
										<div style="font-size: 18px; font-weight: 500; opacity: 0.9; margin-top: 4px;">
											LITROS
										</div>
									</v-col>
									<v-col cols="5" class="text-center">
										<v-icon color="white" size="80" style="opacity: 0.3;">mdi-cup-water</v-icon>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #4b6cb7 0%, #5c7cbe 100%); transition: all 0.3s;">
							<v-card-title class="white--text pb-2">
								<v-icon color="white" size="28" class="mr-2">mdi-water-check</v-icon>
								<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">DESPACHADO ESTA SEMANA</span>
							</v-card-title>
							<v-card-text class="white--text">
								<v-row align="center" justify="space-between">
									<v-col cols="7">
										<div style="font-size: 42px; font-weight: 700; line-height: 1;">
											{{lastweek_liters_consumption == null ? 0 : lastweek_liters_consumption }}
										</div>
										<div style="font-size: 18px; font-weight: 500; opacity: 0.9; margin-top: 4px;">
											LITROS
										</div>
									</v-col>
									<v-col cols="5" class="text-center">
										<v-icon color="white" size="80" style="opacity: 0.3;">mdi-water-outline</v-icon>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #1a4d7a 0%, #2e5f8e 100%); transition: all 0.3s;">
							<v-card-title class="white--text pb-2">
								<v-icon color="white" size="28" class="mr-2">mdi-water-pump</v-icon>
								<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">DESPACHADO ESTE MES</span>
							</v-card-title>
							<v-card-text class="white--text">
								<v-row align="center" justify="space-between">
									<v-col cols="7">
										<div style="font-size: 42px; font-weight: 700; line-height: 1;">
											{{lastmonth_liters_consumption == null ? 0 : lastmonth_liters_consumption }}
										</div>
										<div style="font-size: 18px; font-weight: 500; opacity: 0.9; margin-top: 4px;">
											LITROS
										</div>
									</v-col>
									<v-col cols="5" class="text-center">
										<v-icon color="white" size="80" style="opacity: 0.3;">mdi-water-plus</v-icon>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #e0f2f7 0%, #b3d9e6 100%); transition: all 0.3s;">
							<v-card-title class="d-flex align-center justify-space-between pb-2">
								<div class="d-flex align-center">
									<v-icon size="28" class="mr-2" :color="variacionToday.variacionUNIT > 0 ? 'success' : 'error'">mdi-cart-outline</v-icon>
									<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">VENDIDOS HOY</span>
								</div>
								<v-chip small :color="variacionToday.variacionUNIT > 0 ? 'success' : 'error'" dark>
									<v-icon small class="mr-1">{{variacionToday.variacionUNIT > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'}}</v-icon>
									{{variacionToday.variacionUNIT}}%
								</v-chip>
							</v-card-title>
							<v-card-text>
								<v-row align="center" justify="space-between">
									<v-col cols="7">
										<div style="font-size: 42px; font-weight: 700; line-height: 1; color: #333;">
											{{today_sales.units == null ? '0' : today_sales.units }}
										</div>
										<div style="font-size: 16px; font-weight: 500; color: #666; margin-top: 4px;">
											UNIDADES
										</div>
									</v-col>
									<v-col cols="5" class="text-center">
										<v-icon size="70" :color="variacionToday.variacionUNIT > 0 ? 'success' : 'error'" style="opacity: 0.5;">
											{{variacionToday.variacionUNIT > 0 ? 'mdi-trending-up' : 'mdi-trending-down'}}
										</v-icon>
									</v-col>
								</v-row>
								<v-divider class="my-3"></v-divider>
								<div class="d-flex justify-space-between align-center" style="color: #666; font-size: 13px;">
									<span>Vendidas ayer:</span>
									<span style="font-weight: 600; font-size: 14px;">{{today_sales.previous_units == null ? 0 : today_sales.previous_units}}</span>
								</div>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #d4e7f5 0%, #c8e0f0 100%); transition: all 0.3s;">
							<v-card-title class="d-flex align-center justify-space-between pb-2">
								<div class="d-flex align-center">
									<v-icon size="28" class="mr-2" :color="variacionWeek.variacionUNIT > 0 ? 'success' : 'error'">mdi-cart-check</v-icon>
									<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">VENDIDOS ESTA SEMANA</span>
								</div>
								<v-chip small :color="variacionWeek.variacionUNIT > 0 ? 'success' : 'error'" dark>
									<v-icon small class="mr-1">{{variacionWeek.variacionUNIT > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'}}</v-icon>
									{{variacionWeek.variacionUNIT}}%
								</v-chip>
							</v-card-title>
							<v-card-text>
								<v-row align="center" justify="space-between">
									<v-col cols="7">
										<div style="font-size: 42px; font-weight: 700; line-height: 1; color: #333;">
											{{lastweek_sales.units == null ? '0' : lastweek_sales.units }}
										</div>
										<div style="font-size: 16px; font-weight: 500; color: #666; margin-top: 4px;">
											UNIDADES
										</div>
									</v-col>
									<v-col cols="5" class="text-center">
										<v-icon size="70" :color="variacionWeek.variacionUNIT > 0 ? 'success' : 'error'" style="opacity: 0.5;">
											{{variacionWeek.variacionUNIT > 0 ? 'mdi-trending-up' : 'mdi-trending-down'}}
										</v-icon>
									</v-col>
								</v-row>
								<v-divider class="my-3"></v-divider>
								<div class="d-flex justify-space-between align-center" style="color: #666; font-size: 13px;">
									<span>Semana pasada:</span>
									<span style="font-weight: 600; font-size: 14px;">{{lastweek_sales.previous_units == null ? 0 : lastweek_sales.previous_units}}</span>
								</div>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card elevation="3" rounded="lg" class="hover-card" style="background: linear-gradient(135deg, #c5dde8 0%, #b8d4e3 100%); transition: all 0.3s;">
							<v-card-title class="d-flex align-center justify-space-between pb-2">
								<div class="d-flex align-center">
									<v-icon size="28" class="mr-2" :color="variacionMounth.variacionUNIT > 0 ? 'success' : 'error'">mdi-cart-variant</v-icon>
									<span style="font-weight: 500; font-size: 16px; letter-spacing: 0.5px;">VENDIDOS ESTE MES</span>
								</div>
								<v-chip small :color="variacionMounth.variacionUNIT > 0 ? 'success' : 'error'" dark>
									<v-icon small class="mr-1">{{variacionMounth.variacionUNIT > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'}}</v-icon>
									{{variacionMounth.variacionUNIT}}%
								</v-chip>
							</v-card-title>
							<v-card-text>
								<v-row align="center" justify="space-between">
									<v-col cols="7">
										<div style="font-size: 42px; font-weight: 700; line-height: 1; color: #333;">
											{{lastmonth_sales.units == null ? '0' : lastmonth_sales.units }}
										</div>
										<div style="font-size: 16px; font-weight: 500; color: #666; margin-top: 4px;">
											UNIDADES
										</div>
									</v-col>
									<v-col cols="5" class="text-center">
										<v-icon size="70" :color="variacionMounth.variacionUNIT > 0 ? 'success' : 'error'" style="opacity: 0.5;">
											{{variacionMounth.variacionUNIT > 0 ? 'mdi-trending-up' : 'mdi-trending-down'}}
										</v-icon>
									</v-col>
								</v-row>
								<v-divider class="my-3"></v-divider>
								<div class="d-flex justify-space-between align-center" style="color: #666; font-size: 13px;">
									<span>Mes pasado:</span>
									<span style="font-weight: 600; font-size: 14px;">{{lastmonth_sales.previous_units == null ? 0 : lastmonth_sales.previous_units}}</span>
								</div>	
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</div>
		
		</div>
`
});

export default Home;
