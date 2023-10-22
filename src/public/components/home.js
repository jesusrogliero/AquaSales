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
			let hora = new Date().getHours();
			if (hora >= 6 && hora < 12) {
				this.mensaje = '¡Buenos días!';
			} else if (hora >= 12 && hora < 18) {
				this.mensaje = '¡Buenas tardes!';
			} else {
				this.mensaje = '¡Buenas noches!';
			}
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
				let response = await execute('total-sales');

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.today_sales.bs = parseFloat(this.empty(response.sale_today.today_sales_bs)).toFixed(2);
				this.today_sales.dolar = parseFloat(this.empty(response.sale_today.today_sales_dolar)).toFixed(2);
				this.today_sales.units = response.sale_today.today_sales_units;

				this.lastweek_sales.bs = parseFloat(this.empty(response.sale_week.lastweek_sales_bs)).toFixed(2);
				this.lastweek_sales.dolar = parseFloat(this.empty(response.sale_week.lastweek_sales_dolar)).toFixed(2);
				this.lastweek_sales.units = response.sale_week.lastweek_sales_units;

				this.lastmonth_sales.bs = parseFloat(this.empty(response.sale_mounth.lastmonth_sales_bs)).toFixed(2);
				this.lastmonth_sales.dolar = parseFloat(this.empty(response.sale_mounth.lastmonth_sales_dolar)).toFixed(2);
				this.lastmonth_sales.units = response.sale_mounth.lastmonth_sales_units;

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

			console.log(this.variacionToday);
		}

	},

	template: `
		<div>

			<v-container class="fill-height  mb-n2" fluid>
				<v-row>
					<v-col cols="12" lg="6" md="6" sm="6">
						
						<h3>
							<v-icon size="30" class="mr-2">mdi-briefcase-variant-outline</v-icon>
							{{mensaje}} | BCV: {{bcv}} BsS
						</h3>
					</v-col>	
					
					<v-spacer/>

					<div class="mt-1">
						<v-btn color="green" @click="details=!details" text class="mr-2" elevation="0">
							<v-icon>mdi-currency-usd</v-icon>
							<span v-if="details">Totales</span> 
							<span v-else>Detalles</span>  
						</v-btn>
					</div>

					<div class="mt-1">
						<v-btn color="transparent" class="mr-2" elevation="0" @click="toNewSale">
							<v-icon>mdi-point-of-sale</v-icon>
							<span>Nueva Venta</span>  
						</v-btn>
					</div>

					<div class="mt-1">
						<v-btn color="red" text class="mr-2" elevation="0" @click="toReport">
							<v-icon>mdi-deskphone</v-icon>
							<span>Reportes</span>  
						</v-btn>
					</div>

					<div class="mt-1">
						<admin-autenticate/>
					</div>
			
				</v-row>
			</v-container>
		
			<div class="mx-2 mt-10">
				<v-row>
					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card color="#ECEFF1">
							<v-card-title>
								INGRESOS HOY
								<v-icon @click="sumeryReportPdf('TODAY')"  class="ml-2" color="green">mdi-calendar-month</v-icon> 
							</v-card-title>
							</v-card-title>
							<v-card-text>
								<v-row v-if="details">

									<v-col cols="12">
										<b style="font-size:15pt;">Pago Movil: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.today_icomes.mobile_payment_icome == null ? 0 : formatNumber(icomes.today_icomes.mobile_payment_icome) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Efectivo en BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.today_icomes.cash_bolivares_icome == null ? 0 : formatNumber(icomes.today_icomes.cash_bolivares_icome) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;">Efectivo en $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.today_icomes.cash_dollar_icome == null ? 0 : formatNumber(icomes.today_icomes.cash_dollar_icome) }} $
										</span>
									</v-col>
								</v-row>

								<v-row v-else>

									<v-col cols="12">
										<b style="font-size:15pt;">Total BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{today_sales.bs == null ? 0 : today_sales.bs }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Total $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{today_sales.dolar == null ? 0 : today_sales.dolar }} $
										</span>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card color="#ECEFF1">
							
							<v-card-title>
								INGRESOS ESTA SEMANA
								<v-icon @click="sumeryReportPdf('WEEK')" class="ml-2" color="green">mdi-calendar-month</v-icon>  
							</v-card-title>

							<v-card-text>
								<v-row v-if="details">
									<v-col cols="12">
										<b style="font-size:15pt;">Pago Movil: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.week_icome.mobile_payment_icome == null ? 0 : formatNumber(icomes.week_icome.mobile_payment_icome) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Efectivo en BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.week_icome.cash_bolivares_icome == null ? 0 : formatNumber(icomes.week_icome.cash_bolivares_icome) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;">Efectivo en $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.week_icome.cash_dollar_icome == null ? 0 : formatNumber(icomes.week_icome.cash_dollar_icome) }} $
										</span>
									</v-col>
								
								</v-row>

								<v-row v-else>

									<v-col cols="12">
										<b style="font-size:15pt;">Total BsS:</b>
										<span style="font-size:20pt;" class="float-right">  
											{{lastweek_sales.bs == null ? 0 : formatNumber(lastweek_sales.bs) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" class="mt-n4">Total $</b>
										<span style="font-size:20pt;" class="float-right">  
											{{lastweek_sales.dolar == null ? 0 : formatNumber(lastweek_sales.dolar) }} $
										</span>
										
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card color="#ECEFF1">
							<v-card-title>
							INGRESOS DE ESTE MES
							<v-icon  @click="sumeryReportPdf('MOUNTH')" class="ml-2" color="green">mdi-calendar-month</v-icon> </v-card-title>
							<v-card-text>
								<v-row v-if="details">
									<v-col cols="12">
										<b style="font-size:15pt;">Pago Movil: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.month_icome.mobile_payment_icome == null ? 0 : formatNumber(icomes.month_icome.mobile_payment_icome) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Efectivo en BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.month_icome.cash_bolivares_icome == null ? 0 : formatNumber(icomes.month_icome.cash_bolivares_icome) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;">Efectivo en $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.month_icome.cash_dollar_icome == null ? 0 : formatNumber(icomes.month_icome.cash_dollar_icome) }} $
										</span>
									</v-col>
								</v-row>

								<v-row v-else>

									<v-col cols="12">
										<b style="font-size:15pt;">Total BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{lastmonth_sales.bs == null ? 0 : formatNumber( lastmonth_sales.bs ) }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Total $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{lastmonth_sales.dolar == null ? 0 : formatNumber( lastmonth_sales.dolar ) }} $
										</span>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
					<v-card color="#ECEFF1">
						<v-card-title>
							Despachado Hoy 
						</v-card-title>
						<v-card-text>
						<v-row>
						<h1 class="ml-2">{{today_liters_consumption == null ? 0 : today_liters_consumption }} LT</h1>
						<v-spacer></v-spacer>
						<v-img
								class="mt-n9"
								height="80"
								max-width="80"
								src="../public/resources/images/botella.png"
							></v-img>
					</v-row>
							
						</v-card-text>
					</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card color="#ECEFF1">
							<v-card-title>Despachado esta Semana</v-card-title>
							<v-card-text>
								<v-row>
									<h1 class="ml-2">{{lastweek_liters_consumption == null ? 0 : lastweek_liters_consumption }} LT</h1>
									<v-spacer></v-spacer>
									<v-img
										class="mt-n9"
										height="80"
										max-width="80"
										src="../public/resources/images/botella-de-agua.png"
									></v-img>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card color="#ECEFF1">
							<v-card-title>Despachado Este mes</v-card-title>
							<v-card-text>
								<v-row>
									<h1 class="ml-2">{{lastmonth_liters_consumption == null ? 0 : lastmonth_liters_consumption }} LT</h1>
									<v-spacer></v-spacer>
									<v-icon size="80" class="mr-2 mt-n9" color="green">mdi-trending-up</v-icon>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card  color="#ECEFF1">
							<v-card-title>
							<span  class="mt-n3">
							Vendidos Hoy 
								<v-icon v-if="variacionToday.variacionUNIT > 0" size="50" class="mr-n4" color="green" >mdi-triangle-small-up</v-icon>  
								<v-icon v-else size="50" class="mr-n4" color="red" >mdi-triangle-small-up</v-icon>  
								<span>{{variacionToday.variacionUNIT}}%</span>
							</span>
							</v-card-title>
							<v-card-text>
								<v-row  class="mt-n2">
									<h1 class="ml-2 mb-2">{{today_sales.units == null ? '0 UNID' : today_sales.units }} </h1>
									<v-spacer></v-spacer>
									<v-icon v-if="variacionToday.variacionUNIT > 0" size="80" class="mr-2 mt-n15" color="green">mdi-trending-up</v-icon>
									<v-icon v-else size="80" class="mr-2 mt-n15" color="red">mdi-trending-down</v-icon>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card  color="#ECEFF1">
							<v-card-title>
							
							<span class="mt-n3">
							Vendidos Esta Semana
								<v-icon v-if="variacionWeek.variacionUNIT > 0" size="50" class="mr-n2" color="green" >mdi-triangle-small-up</v-icon> 
								<v-icon v-else size="50" class="mr-n4" color="red" >mdi-triangle-small-down</v-icon>   
								<span>{{variacionWeek.variacionUNIT}}%</span>
							</span>
							</v-card-title>
							<v-card-text>
								<v-row class="mt-n2">
									<h1 class="ml-2 mb-2">{{lastweek_sales.units == null ? '0 UNID' : lastweek_sales.units }}</h1>
									<v-spacer></v-spacer>
									<v-icon v-if="variacionWeek.variacionUNIT > 0" size="80" class="mr-2 mt-n15" color="green">mdi-trending-up</v-icon>
									<v-icon v-else size="80" class="mr-2 mt-n15" color="red">mdi-trending-down</v-icon>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card  color="#ECEFF1">
							<v-card-title>Recargas Pendientes</v-card-title>
							<v-card-text>
								<v-row>
									<h1 class="ml-2">{{pending_dispatch == null ? 0 : pending_dispatch }} UNID</h1>
									<v-spacer></v-spacer>
									
									<v-img
									class="mt-n10"
									height="80"
									max-width="80"
									src="../public/resources/images/despacho.png"
								></v-img>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</div>
		
		</div>
`
});

export default Home;
