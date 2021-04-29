const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const {Client} = require("pg");
const cors = require('cors');
const { response } = require("express");

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'visitcounter.log')

// const client = new Client({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'postgres',
//     password: 'postgres',
//     port: 5432,
// })
const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASS,
    port: 5432,
})
client.connect();

let visitCounter = 15;
initDatabase()

const PORT = process.env.PORT || 5000;

function loadFromDatabase(cb) {
    client.query("SELECT counter FROM visits WHERE computer = 'marian_notebook'", (err, res) => {
        cb(res.rows[0].counter);
    })
}

function initDatabase() {
    client.query('CREATE TABLE IF NOT EXISTS visits (computer varchar, counter integer NOT NULL)')
    client.query("INSERT INTO visits SELECT 'marian_notebook', 0 WHERE NOT EXISTS (SELECT * FROM visits WHERE computer = 'marian_notebook')")
}

function saveToDatabase() {
    client.query("UPDATE visits SET counter = $1 WHERE computer = 'marian_notebook'", [visitCounter])
}

app.get('/api/ping', (req, res) => {
    loadFromDatabase(function (visits){
        visitCounter = visits;
        visitCounter++;
        saveToDatabase()
    });
    fs.writeFile(filePath, visitCounter.toString(), {'flag':'w'}, function(err) {
        if (err) {
            return console.error(err);
        }
    });
    loadFromDatabase(function (visits) {
        console.log(visits)
        res.send({'pong' : visits});
    })
});

app.listen(PORT, () => {
    console.log(`Server has started on port ${process.env.PORT || 5000}`);
});