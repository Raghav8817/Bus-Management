const db = require('../config/db');

const createTable = `
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const seedData = `
INSERT INTO notifications (title, message, role) VALUES 
('Welcome to WCTM Transport!', 'We are excited to have you on board. You can now track your bus and mark attendance in real-time.', 'student'),
('Delayed Route Alert', 'Route 7 Bus is running 15 minutes late due to traffic. Please stay updated.', 'student'),
('Holiday Notice', 'Bus services will be suspended on coming Monday due to the public holiday.', 'all');
`;

db.query(createTable, (err) => {
    if (err) {
        console.error('Table creation failed:', err);
        process.exit(1);
    }
    console.log('Notifications table created or already exists.');

    // Check if data already exists to avoid duplicates
    db.query('SELECT COUNT(*) as count FROM notifications', (err2, results) => {
        if (results[0].count === 0) {
            db.query(seedData, (err3) => {
                if (err3) {
                    console.error('Seeding failed:', err3);
                } else {
                    console.log('Sample notifications seeded.');
                }
                process.exit(0);
            });
        } else {
            console.log('Table already has data, skipping seed.');
            process.exit(0);
        }
    });
});
