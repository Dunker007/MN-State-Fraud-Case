/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:/Repos GIT/MN State Fraud Case/org chart.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
});

