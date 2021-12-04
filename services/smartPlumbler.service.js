"use strict";

const csvMixin = require('../mixins/csv.mixin');

module.exports = {
	name: "smartPlumber",
	mixins: [csvMixin],

	settings: {},

	dependencies: [],

	actions: {

		receiveData: {
			rest: {
				method: "POST",
				path: "/receiveData/sensor/:id/temperature/:temperature"
			},
			async handler(ctx) {

				const date = new Date();

        const data = {
          id: ctx.params.id,
          temperature: Number(ctx.params.temperature),
          timestamp: date.toISOString()
        }

				await this.saveCsv(data)

				return data;
			}
		},

		sendData: {
			rest: {
				method: "GET",
				path: "/sendData/sensor/:id/date/:date"
			},
			async handler(ctx) {

				return await this.readCsv(ctx.params.id, ctx.params.date);

			}
		}

	},


	events: {},

	methods: {},

	created() {},

	async started() {},

	async stopped() {}
};
