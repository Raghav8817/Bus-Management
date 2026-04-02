require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const queries = [
    `CREATE TABLE IF NOT EXISTS bus_tracking (
        bus_number VARCHAR(50) PRIMARY KEY,
        distance FLOAT,
        arrival_time INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100),
        attendance_type VARCHAR(50),
        date_str VARCHAR(20),
        status VARCHAR(20),
        UNIQUE KEY uq_attendance (user_id, attendance_type, date_str)
    )`,
    `CREATE TABLE IF NOT EXISTS generic_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_type VARCHAR(50),
        reference_id VARCHAR(100),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

async function runQueries() {
    for (let query of queries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            console.log("Executed:", query.substring(0, 50) + "...");
        } catch (err) {
            console.error("Error executing:", query);
            console.error(err);
        }
    }
    db.end();
}

runQueries();
