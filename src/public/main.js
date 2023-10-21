'use strict'

import routes from './routes.js';
import Snapback from "./utils/SnackbarApp.js";
import navigation from './utils/navigation.js';
const router = new VueRouter({ routes: routes });

let vue = new Vue({
	el: '#app',
	vuetify: new Vuetify({
		theme: {
			themes: {
				light: {
					primary: '#1976D2',
					secondary: '#424242',
					accent: '#82B1FF',
					error: '#FF5252',
					info: '#2196F3',
					success: '#4CAF50',
					warning: '#FFC107',
				},
			},
		},
	}),
	router: router,

	data: function () {
		return {
			alert: false,
			textAlert: "",
			colorAlert: "",
			codeAlert: 0,
			iconAlert: null,
			timeAlert: null,

		}
	},

	async created() {
		try {

			let response = await execute('ajust-products');

			if(response.code == 0 ){
				throw new Error(response.message);
			}

		} catch (error) {
			alertApp({color: "error", icon: "alert", text: error.message});
		}
	},


	methods: {
		// funcion que activa la alert
		activeAlert: function (params = {}) {
			this.colorAlert = params.code == null ? params.color : "info";
			this.textAlert = params.text != null ? params.text : "";
			this.iconAlert = params.icon;
			this.codeAlert++;

		},
	},

});

window.appInstance = vue;

/* funcion que da formato a las unidades de numericas */
window.formatNumber = function(numero) {
	try {
		numero = parseFloat(numero);
		const partes = numero.toFixed(2).toString().split(".");
		partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return partes.join(".");
	} catch (e) {
		console.error(e);
	}
};
