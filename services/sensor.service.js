"use strict";

const DbMixin = require("../mixins/db.mixin");
const csvMixin = require('../mixins/csv.mixin');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "sensor",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("sensor"), csvMixin],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses

		fields: [
			"_id",
			"description",
			"sector",
			"minimumTemperature",
			"maximumTemperature",
      "idealTemperature",
      "toleranceToIdealTemperature"
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
      description: "string|min:3",
      sector: "string|min:3",
			minimumTemperature: "number",
      maximumTemperature: "number",
      idealTemperature: "number",
      toleranceToIdealTemperature: "number"
		}
	},

	/**
	 * Action Hooks
	 */
	hooks: {},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * The "moleculer-db" mixin registers the following actions:
		 *  - list
		 *  - find
		 *  - count
		 *  - create
		 *  - insert
		 *  - update
		 *  - remove
		 */

		// --- ADDITIONAL ACTIONS ---

		/**
		 * Increase the quantity of the product item.
		 */
     registerSensor: {
			rest: "POST /register",
			params: {
				identifier: "string",
      	description: "string|min:3",
      	sector: "string|min:3",
				minimumTemperature: "number",
      	maximumTemperature: "number",
      	idealTemperature: "number",
      	toleranceToIdealTemperature: "number"
			},
			async handler(ctx) {

				const data = {
					_id: ctx.params.identifier,
      		description: ctx.params.description,
      		sector: ctx.params.sector,
					minimumTemperature: ctx.params.minimumTemperature,
      		maximumTemperature: ctx.params.maximumTemperature,
      		idealTemperature: ctx.params.idealTemperature,
      		toleranceToIdealTemperature: ctx.params.toleranceToIdealTemperature
				}

				const doc = await this.adapter.insert(data);
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("created", json, ctx);

				return json;
			}
		},

		findSensor: {
			rest: "GET /find/:_id",
			params: {
				_id: "string",
			},
			async handler(ctx) {
				const doc = await this.adapter.findById(ctx.params._id);
				const json = await this.transformDocuments(ctx, ctx.params, doc);

				const currentTemperature = await this.readLastTemperatureCsv(ctx.params._id);

				json.currentTemperature = Number(currentTemperature.temperature);

				await this.entityChanged("found", json, ctx);

				return json;
			}
		},

		updateSensor: {
			rest: "PUT /update",
			params: {
				identifier: "string",
      	description: "string|min:3",
      	sector: "string|min:3",
				minimumTemperature: "number",
      	maximumTemperature: "number",
      	idealTemperature: "number",
      	toleranceToIdealTemperature: "number"
			},
			async handler(ctx) {

				const data = {
					_id: ctx.params.identifier,
      		description: ctx.params.description,
      		sector: ctx.params.sector,
					minimumTemperature: ctx.params.minimumTemperature,
      		maximumTemperature: ctx.params.maximumTemperature,
      		idealTemperature: ctx.params.idealTemperature,
      		toleranceToIdealTemperature: ctx.params.toleranceToIdealTemperature
				}

				const doc = await this.adapter.updateById(data._id, data);
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("updated", json, ctx);

				return json;
			}
		},

		removeSensor: {
			rest: "DELETE /remove/:_id",
			params: {
				_id: "string"
			},
			async handler(ctx) {
				const doc = await this.adapter.removeById(ctx.params._id);
				const json = await this.transformDocuments(ctx, ctx.params, doc);
				await this.entityChanged("deleted", json, ctx);

				return json;
			}
		},
		
		listSensor: {
			rest: "GET /list/",

			async handler(ctx) {
				const data = await ctx.call('sensor.list');

				const sensors = data.rows;

				const sensorsWithTemperature = sensors.map(async sensor => {
					const currentTemperature = await this.readLastTemperatureCsv(sensor._id);
					sensor.currentTemperature = Number(currentTemperature.temperature);
					return sensor;
				});

				return Promise.all(sensorsWithTemperature);
			}
		}
	
	},


	/**
	 * Methods
	 */
	methods: {
		/**
		 * Loading sample data to the collection.
		 * It is called in the DB.mixin after the database
		 * connection establishing & the collection is empty.
		 */
		async seedDB() {
			await this.adapter.insertMany([
				{ 
          identifier: 'Teste-001', 
          description: 'Description',
          sector: 'Sector',
          minimumTemperature: 1,
          maximumTemperature: 10,
          idealTemperature: 5,
          toleranceToIdealTemperature: 5
        },
			]);
		}
	},

	/**
	 * Fired after database connection establishing.
	 */
	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
