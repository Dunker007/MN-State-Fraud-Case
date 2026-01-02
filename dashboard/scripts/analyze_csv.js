/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const Papa = require('papaparse');

const csvPath = 'c:/Repos GIT/MN State Fraud Case/Licensing_Lookup_Results_ Dec.30.2025.csv';
const fileContent = fs.readFileSync(csvPath, 'utf8');

Papa.parse(fileContent, {
    header: true,
    complete: function (results) {
        const statuses = {};
        const redFlags = [];

        results.data.forEach(row => {
            const status = row['License Status'];
            if (!status) return;

            // Count unique statuses
            statuses[status] = (statuses[status] || 0) + 1;

            // Identify Red Flags (Non-Active or specific keywords)
            const isRedFlag = !status.startsWith('Active') || status.includes('Revoc') || status.includes('Suspend') || status.includes('Condit') || status.includes('Deny') || status.includes('Close');

            if (isRedFlag) {
                redFlags.push(row);
            }
        });

        console.log('Status Counts:', JSON.stringify(statuses, null, 2));
        console.log('Total Rows:', results.data.length);
        console.log('Total Red Flags Identified:', redFlags.length);
    }
});

