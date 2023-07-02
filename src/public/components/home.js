'use strict'

// componente home
let home = Vue.component('home', {

	data: function () {
		return {
			montoVendido: '5.000',
		}
	},

	template: `
		<div>
		
			<div class="mx-2 mt-10">
			<v-row>
				<v-col cols="12" sm="6" md="4" lg="4">
					<v-card :loading="loading" color="#ECEFF1">
						<v-card-title>INGRESOS HOY</v-card-title>
						<v-card-text>
							<v-row>
								<h1 class="ml-2">{{ product_primary_icome == null ? "0.00 $" : product_primary_icome}}
								</h1>
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
									<h1 class="ml-2">{{ consumption_production == null ? "0.00 $" :
									consumption_production}}
									</h1>
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
								<h1 class="ml-2">{{ product_final_icome == null ? "0.00 $" : product_final_icome}}</h1>
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
								<h1 class="ml-2">{{ product_final_icome == null ? "0 UNID" : product_final_icome}}</h1>
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
							<h1 class="ml-2">{{ product_final_icome == null ? "0 UNID" : product_final_icome}}</h1>
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
						<h1 class="ml-2">{{ product_final_icome == null ? "0 UNID" : product_final_icome}}</h1>
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

			<v-row class="justify-center">
				<v-col cols="3">
					<v-card color="indigo lighten-4" class="pb-2" elevation="5">
						<p class="text-h5 text-center"> Nueva Venta</p>
						<v-img
							class="mx-auto"
							height="100"
							max-width="100"
							src="../public/resources/images/punto-de-venta.png"
						></v-img>              
					</v-card>
				</v-col>

				<v-col cols="3">
					<v-card color="indigo lighten-4" class="pb-2" elevation="5">
						<p class="text-h5 text-center"> Ingresar Mercancia</p>
						<v-img
							class="mx-auto"
							height="100"
							max-width="100"
							src="../public/resources/images/agua.png"
						></v-img>
					</v-card>
				</v-col>

				<v-col cols="3">
					<v-card color="indigo lighten-4" class="pb-2" elevation="5">
						<p class="text-h5 text-center"> Ingresar Mercancia</p>
						<v-img
							class="mx-auto"
							height="100"
							max-width="100"
							src="../public/resources/images/ingreso.png"
						></v-img>
					</v-card>
				</v-col>

			</v-row>
		</div>


		</div>
		`
});

export default home;
