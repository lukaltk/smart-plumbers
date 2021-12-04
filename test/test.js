const csv = require('csv').parse;
const fs = require('fs');

fs.createReadStream('./csv/norte-a/2021-11-27.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });