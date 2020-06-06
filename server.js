const csv = require('csv-parser');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');

// Loads environment variables
dotenv.config();
const hostname = "0.0.0.0";
const port = process.env.PORT || 80;
const gmap_api_key = "AIzaSyDe6e2HOSU8oBAhIx8991OTPla8WbvP7Dw";
const traffic_accident_csv = './static/台中.csv';

// In-memory data
var accident = [];

// Setting up the server.
var app = express();
app.set('view engine', 'ejs');

// Sets files under static/ as static files.
app.use(express.static('static'));

// Serves homepage with index.html.
app.get('/', (req, res) => {
    res.render('index', { gmap_api_key })
});

// Gets accident list of different types of accident.
app.get('/accidents', (req, res) => {
    console.log('Got accident location request', req.query);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(accident));
    console.log('Accident location respond');
});

function start_server() {
    app.listen(port);
    console.log('Running server on port ' + port);
}

function load_data_into_memory(callback) {
    console.log('Start loading data into memory.')
    fs.createReadStream(traffic_accident_csv)  
        .pipe(csv())
        .on('data', row => accident.push(row))
        .on('end', () => {
            console.log('Data is loaded into memory.');
            callback();
        });
}

// Entry point for starting the server.
function main() {
    // If traffic accident csv is not set, skipped it.
    if (traffic_accident_csv != null) {
        load_data_into_memory(start_server);
    } else {
        start_server();
    }
}
main();
