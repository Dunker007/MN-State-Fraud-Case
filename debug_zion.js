const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const file = fs.readFileSync('Licensing_Lookup_Results_ Dec.30.2025.csv', 'utf8');
const results = Papa.parse(file, { header: true, skipEmptyLines: true });

const zions = results.data.filter(r => r['Name of Program'] && r['Name of Program'].toUpperCase().includes('ZION'));

console.log("ZION ENTITIES FOUND:");
zions.forEach(z => {
    console.log(`- ${z['Name of Program']} | Status: ${z['License Status']} | Holder: ${z['License Holder']}`);
});
