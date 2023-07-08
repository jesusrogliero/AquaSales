'use strict'

// componente home
let home = Vue.component('home', {

	data: function () {
		return {
			loading: false,

			today_sales_bs: null,
			today_sales_dolar: null,
			today_sales_units: null,
			pending_dispatch: null,

			lastweek_sales_bs: null,
			lastweek_sales_dolar: null,
			lastweek_sales_units: null,

			lastmonth_sales_bs: null,
			lastmonth_sales_dolar: null,
			lastmonth_sales_units: null,

			bcv: 0,
			mensaje: ''
		};
	},

	async mounted() {
		this.loading = true;
		this.saludar();
		await this.getMetricsToday();
		await this.getMetricsLastweek();
		await this.getMetricsLastmonth();
		await this.getPendingDispatch();
		await this.getBcv();
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

		async getBcv() {
			try {
				let response = await execute('show-bcv');

				if (response.code === 0) {
					throw new Error(response.message)
				}
				this.bcv = response;
			} catch (error) {
				alertApp('error', 'alert', error.message);
			}

		},


		async getPendingDispatch() {
			try {
				let response = await execute('pending-dispatch');

				console.log(response)

				if (response.code === 0) {
					throw new Error(response.message)
				}
				this.pending_dispatch = response.pending_dispatch;
			} catch (error) {
				alertApp('error', 'alert', error.message);
			}

		},

		async getMetricsToday() {
			try {
				let response = await execute('metrics-sales-today');
				console.log(response);

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.today_sales_bs = parseFloat(response.today_sales_bs).toFixed(2);
				this.today_sales_dolar = parseFloat(response.today_sales_dolar).toFixed(2);
				this.today_sales_units = response.today_sales_units;
				this.pending_dispatch = response.pending_dispatch;

			} catch (error) {
				alertApp('error', 'alert', error.message);
			}
		},


		async getMetricsLastweek() {
			try {
				let response = await execute('metrics-sales-lastweek');

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.lastweek_sales_bs = parseFloat(response.lastweek_sales_bs).toFixed(2);
				this.lastweek_sales_dolar = parseFloat(response.lastweek_sales_dolar).toFixed(2);
				this.lastweek_sales_units = response.lastweek_sales_units;

			} catch (error) {
				alertApp('error', 'alert', error.message);
			}
		},

		async getMetricsLastmonth() {
			try {
				let response = await execute('metrics-sales-lastmonth');

				if (response.code === 0) {
					throw new Error(response.message)
				}

				this.lastmonth_sales_bs = parseFloat(response.lastmonth_sales_bs).toFixed(2);
				this.lastmonth_sales_dolar = parseFloat(response.lastmonth_sales_dolar).toFixed(2);
				this.lastmonth_sales_units = parseFloat(response.lastmonth_sales_units).toFixed(2);

			} catch (error) {
				alertApp('error', 'alert', error.message);
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
					
				</v-row>
			</v-container>
		
			<div class="mx-2 mt-10">
			<v-row>
				<v-col cols="12" sm="6" md="4" lg="4">
					<v-card :loading="loading" color="#ECEFF1">
						<v-card-title>INGRESOS HOY</v-card-title>
						<v-card-text>
							<v-row>

								<v-col cols="12">
									<h1 class="ml-2">{{today_sales_bs == null ? 0 : today_sales_bs }} BsS </h1>
								</v-col>
								<v-col>
									<h1 class="ml-2">{{today_sales_dolar == null ? 0 : today_sales_dolar }} $ </h1>
								</v-col>
								
								<v-spacer></v-spacer>
								<v-icon size="80" class="mr-2 mt-n9" color="green ">mdi-trending-up</v-icon>
							</v-row>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="4" lg="4">
					<div>
						<v-card :loading="loading" color="#ECEFF1">
							<v-card-title>INGRESOS ESTA SEMANA</v-card-title>
							<v-card-text>
								<v-row>
									<v-col cols="12">
										<h1 class="ml-2">{{lastweek_sales_bs == null ? 0 : lastweek_sales_bs }} BsS</h1>
									</v-col>
									<v-col>
										<h1 class="ml-2">{{lastweek_sales_dolar == null ? 0 : lastweek_sales_dolar }} $</h1>
									</v-col>

									<v-spacer></v-spacer>
									<v-icon size="80" class="mr-2 mt-n9" color="green">mdi-trending-up</v-icon>
								</v-row>
							</v-card-text>
						</v-card>
					</div>

				</v-col>

				<v-col cols="12" sm="6" md="4" lg="4">
					<v-card :loading="loading" color="#ECEFF1">
						<v-card-title>INGRESOS DE ESTE MES</v-card-title>
						<v-card-text>
							<v-row>
								<v-col cols="12">
									<h1 class="ml-2">{{lastmonth_sales_bs == null ? 0 : lastmonth_sales_bs }} BsS</h1>
								</v-col>
								<v-col>
									<h1 class="ml-2">{{lastmonth_sales_dolar == null ? 0 : lastmonth_sales_dolar }} $</h1>
								</v-col>

								<v-spacer></v-spacer>
								<v-icon size="80" class="mt-n9" color="primary">mdi-trending-up</v-icon>
							</v-row>
						</v-card-text>
					</v-card>
				</v-col>

				<v-col cols="12" sm="6" md="4" lg="4">
					<v-card :loading="loading" color="#ECEFF1">
						<v-card-title>Vendidos Hoy</v-card-title>
						<v-card-text>
							<v-row>
								<h1 class="ml-2">{{today_sales_units == null ? 0 : today_sales_units }} UNID</h1>
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
				<v-card :loading="loading" color="#ECEFF1">
					<v-card-title>Vendidos Esta Semana</v-card-title>
					<v-card-text>
						<v-row>
							<h1 class="ml-2">{{lastweek_sales_units == null ? 0 : lastweek_sales_units }} UNID</h1>
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
			<v-card :loading="loading" color="#ECEFF1">
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

export default home;
