'use strict';

const fs = require('fs');
const csvParser = require('csv').parse;
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter;
const { MoleculerError } = require('moleculer').Errors;

module.exports = {
  name: 'csv-mixin',
  mixins: [],

  /**
   * Settings
   */
  settings: {},

  /**
   * Methods
   */
  methods: {

    async saveCsv(data) {

      try {
        const dir = `./csv/${data.id}`;

        if(!fs.existsSync(dir)) fs.mkdirSync(dir);
  
        const csvWriter = createObjectCsvWriter({
          path: `${dir}/${data.timestamp.split('T')[0]}.csv`,
          header: [
            { id: 'id', title: 'Id'},
            { id: 'temperature', title: 'Temperature'},
            { id: 'timestamp', title: 'Timestamp'},
          ],
          append: true
        });
  
        await csvWriter.writeRecords([data]);

      } catch(error) {
        throw new MoleculerError('Error to save CSV', 500, 'ERR_SAVE_CSV', error);
      }    
    },

    async readCsv(id, date) {

      try {
        const dir = `./csv/${id}/${date}.csv`;

        const data = [];
        
        await new Promise((resolve, reject) => {
          fs.createReadStream(dir).pipe(csvParser())
            .on('data', (row) => {
              data.push({
                id: row[0],
                temperature: row[1],
                timestamp: row[2],
              });
            })
            .on('end', () => {
              console.log('CSV file successfully processed');
              resolve();
            });
        });

        return data;
      } catch (error) {
        throw new MoleculerError('Error to read CSV', 500, 'ERR_READ_CSV', error);
      }
    },

    async readLastTemperatureCsv(id) {

      try {
        const folder = `./csv/${id}`
      
        const files = fs.readdirSync(folder);
        const file = files.sort().reverse()[0];
        const date = file.split('.')[0]
  
        const temperature = await this.readCsv(id, date);
  
        return  temperature[temperature.length - 1];
      } catch (error) {
        throw new MoleculerError('Error to read last temperature of CSV', 500, 'ERR_READ_LAST_TEMPERATURE_CSV', error);
      }
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created () {},

  /**
   * Service started lifecycle event handler
   */
  async started () {},

  /**
   * Service stopped lifecycle event handler
   */
  async stopped () {}
};
