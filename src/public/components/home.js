'use strict'
import '../components/AdminAutenticate.js';

// componente home
let Home = Vue.component('Home', {

	data: function () {
		return {
			loading: false,

			today_sales: {},
			lastweek_sales: {},
			lastmonth_sales: {},

			icomes: {},

			pending_dispatch: null,

			today_liters_consumption: null,
			lastweek_liters_consumption: null,
			lastmonth_liters_consumption: null,

			bcv: 0,
			mensaje: ''
		};
	},

	async mounted() {
		this.loading = true;
		this.saludar();
		await this.getMetricsIcomes();
		await this.getMetricsToday();
		await this.getMetricsLastweek();
		await this.getMetricsLastmonth();
		await this.getLitersDispatch();
		await this.getPendingDispatch();
		await this.getBcv();
		console.log(this.icomes);
		this.loading = false;
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
				alertApp({color: "error", icon: "alert", text: error.message});
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
				alertApp({color: "error", icon: "alert", text: error.message});
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
				alertApp({color: "error", icon: "alert", text: error.message});
			}

		},

		async getMetricsToday() {
			try {
				let response = await execute('metrics-sales-today');

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.today_sales.bs = parseFloat(this.empty(response.today_sales_bs)).toFixed(2);
				this.today_sales.dolar = parseFloat(this.empty(response.today_sales_dolar)).toFixed(2);
				this.today_sales.units = response.today_sales_units;
	
			} catch (error) {
				alertApp({color: "error", icon: "alert", text: error.message});
			}
		},


		async getMetricsLastweek() {
			try {
				let response = await execute('metrics-sales-lastweek');

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.lastweek_sales.bs = parseFloat(this.empty(response.lastweek_sales_bs)).toFixed(2);
				this.lastweek_sales.dolar = parseFloat( this.empty(response.lastweek_sales_dolar)).toFixed(2);
				this.lastweek_sales.units = response.lastweek_sales_units;

			} catch (error) {
				alertApp({color: "error", icon: "alert", text: error.message});
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
				alertApp({color: "error", icon: "alert", text: error.message});
			}
		},

		async getMetricsLastmonth() {
			try {
				let response = await execute('metrics-sales-lastmonth');

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.lastmonth_sales.bs = parseFloat(this.empty(response.lastmonth_sales_bs)).toFixed(2);
				this.lastmonth_sales.dolar = parseFloat(this.empty(response.lastmonth_sales_dolar)).toFixed(2);
				this.lastmonth_sales.units = response.lastmonth_sales_units;

			} catch (error) {
				alertApp({color: "error", icon: "alert", text: error.message});
			}
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
								<v-icon  class="ml-2" color="green">mdi-calendar-month</v-icon> </v-card-title>
							</v-card-title>
							<v-card-text>
								<v-row>

									<v-col cols="12">
										<b style="font-size:15pt;">Pago Movil: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.today_icomes.mobile_payment_icome == null ? 0 : icomes.today_icomes.mobile_payment_icome }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Efectivo en BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.today_icomes.cash_bolivares_icome == null ? 0 : icomes.today_icomes.cash_bolivares_icome }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;">Efectivo en $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.today_icomes.cash_dollar_icome == null ? 0 : icomes.today_icomes.cash_dollar_icome }} $
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
								<v-icon  class="ml-2" color="green">mdi-calendar-month</v-icon> </v-card-title>
							</v-card-title>
							<v-card-text>
								<v-row>
									<v-col cols="12">
										<b style="font-size:15pt;">Pago Movil: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.week_icome.mobile_payment_icome == null ? 0 : icomes.week_icome.mobile_payment_icome }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Efectivo en BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.week_icome.cash_bolivares_icome == null ? 0 : icomes.week_icome.cash_bolivares_icome }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;">Efectivo en $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.week_icome.cash_dollar_icome == null ? 0 : icomes.week_icome.cash_dollar_icome }} $
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
							<v-icon  class="ml-2" color="green">mdi-calendar-month</v-icon> </v-card-title>
							<v-card-text>
								<v-row>
									<v-col cols="12">
										<b style="font-size:15pt;">Pago Movil: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.month_icome.mobile_payment_icome == null ? 0 : icomes.month_icome.mobile_payment_icome }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;" >Efectivo en BsS: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.month_icome.cash_bolivares_icome == null ? 0 : icomes.month_icome.cash_bolivares_icome }} BsS
										</span>
									</v-col>

									<v-col cols="12">
										<b style="font-size:15pt;">Efectivo en $: </b>
										<span style="font-size:20pt;" class="float-right">  
											{{icomes.month_icome.cash_dollar_icome == null ? 0 : icomes.month_icome.cash_dollar_icome }} $
										</span>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
					<v-card color="#ECEFF1">
						<v-card-title>Volumen Despachado Hoy</v-card-title>
						<v-card-text>
							<v-row>
								<h1 class="ml-2">{{today_liters_consumption == null ? 0 : today_liters_consumption }} LT</h1>
								<v-spacer></v-spacer>
								<v-icon size="80" class="mr-2 mt-n9" color="green">mdi-trending-up</v-icon>
							</v-row>
						</v-card-text>
					</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card color="#ECEFF1">
							<v-card-title>Volumen Despachado esta Semana</v-card-title>
							<v-card-text>
								<v-row>
									<h1 class="ml-2">{{lastweek_liters_consumption == null ? 0 : lastweek_liters_consumption }} LT</h1>
									<v-spacer></v-spacer>
									<v-icon size="80" class="mr-2 mt-n9" color="green">mdi-trending-up</v-icon>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card color="#ECEFF1">
							<v-card-title>Volumen Despachado Este mes</v-card-title>
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
							<v-card-title>Vendidos Hoy</v-card-title>
							<v-card-text>
								<v-row>
									<h1 class="ml-2">{{today_sales.units == null ? 0 : today_sales.units }} UNID</h1>
									<v-spacer></v-spacer>
									<v-img
									class="mt-n10"
									height="80"
									max-width="80"
									src="../public/resources/images/botella.png"
								></v-img>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card  color="#ECEFF1">
							<v-card-title>Vendidos Esta Semana</v-card-title>
							<v-card-text>
								<v-row>
									<h1 class="ml-2">{{lastweek_sales.units == null ? 0 : lastweek_sales.units }} UNID</h1>
									<v-spacer></v-spacer>
									<v-img
									class="mt-n10"
									height="80"
									max-width="80"
									src="../public/resources/images/botella-de-agua.png"
								></v-img>
								</v-row>
							</v-card-text>
						</v-card>
					</v-col>

					<v-col cols="12" sm="6" md="4" lg="4">
						<v-card  color="#ECEFF1">
							<v-card-title>Pendientes Despacho</v-card-title>
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
