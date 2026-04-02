const mysql = require('mysql2');

// Ensures environment variables are hooked if db.js is loaded independently
require('dotenv').config({ path: __dirname + '/../.env' }); 

const db = mysql.createConnection({
    uri: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false }
});

module.exports = db;
