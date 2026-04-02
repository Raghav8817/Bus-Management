require('dotenv').config(); // MUST be at the top to read JWT_SECRET and DATABASE_URL
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./config/db');
const jwt = require("jsonwebtoken");
const cookieparser = require('cookie-parser');

// 1. DYNAMIC CORS: Replace with your actual Vercel URL
app.use(cors({
    origin: ["http://localhost:5173", "https://bus-management-sooty.vercel.app"],
    credentials: true
}));

app.use(express.json());
app.use(cookieparser());

// Helper for dynamic cookie settings based on environment
const cookieOptions = {
    httpOnly: true,
    // When on Render (production), secure must be true and sameSite must be 'none'
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 86400000 // 1 day
};

// --- AUTH VERIFICATION ---
app.get('/verify', (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).send();

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send();
        res.json({ isAuth: true, role: decoded.role });
    });
});

// --- GET USER PROFILE DATA ---
app.get('/user-data', (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ error: "No token found" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });

        let sql = "";
        if (decoded.role === 'student') {
            sql = "SELECT * FROM students WHERE email_id = ?";
        } else if (decoded.role === 'driver') {
            sql = "SELECT * FROM drivers WHERE driver_id = ?";
        } else if (decoded.role === 'management') {
            sql = "SELECT * FROM management WHERE management_id = ?";
        }

        db.query(sql, [decoded.id], (err, results) => {
            if (err) {
                console.error("SQL Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: "User not found" });
            }
        });
    });
});

// --- SIGNUP ---
app.post('/signup', (req, res) => {
    const {
        role, fullName, password, email, contact, address,
        studentBusId, course, branchSem,
        driverId, busId, busNumber,
        managementId
    } = req.body;

    let sql = "";
    let values = [];
    let userIdForToken = "";

    if (role === "student") {
        sql = `INSERT INTO students (full_name, bus_id, course, branch_semester, contact_number, email_id, address, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student')`;
        values = [fullName, studentBusId, course, branchSem, contact, email, address, password];
        userIdForToken = email;
    } else if (role === "driver") {
        sql = `INSERT INTO drivers (full_name, driver_id, bus_id, bus_number, contact_number, address, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'driver')`;
        values = [fullName, driverId, busId, busNumber, contact, address, password];
        userIdForToken = driverId;
    } else if (role === "management") {
        sql = `INSERT INTO management (management_id, full_name, email_id, address, password, role) VALUES (?, ?, ?, ?, ?, 'management')`;
        values = [managementId, fullName, email, address, password];
        userIdForToken = managementId;
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Signup Error:", err.message);
            return res.status(500).json({ error: "Database error during signup" });
        }

        const token = jwt.sign(
            { id: userIdForToken, role: role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie('authToken', token, cookieOptions);
        res.status(201).json({ message: "Success", role: role });
    });
});

// --- LOGIN ---
app.post('/login', (req, res) => {
    const { role, id, password, busNumber } = req.body;

    let sql = "";
    let params = [];

    if (role === "student") {
        sql = "SELECT * FROM students WHERE email_id = ? AND password = ? AND role = 'student'";
        params = [id, password];
    } else if (role === "driver") {
        sql = "SELECT * FROM drivers WHERE driver_id = ? AND bus_number = ? AND password = ? AND role = 'driver'";
        params = [id, busNumber, password];
    } else if (role === "management") {
        sql = "SELECT * FROM management WHERE management_id = ? AND password = ? AND role = 'management'";
        params = [id, password];
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            const user = results[0];
            let identityValue;

            if (role === "student") identityValue = user.email_id;
            else if (role === "driver") identityValue = user.driver_id;
            else if (role === "management") identityValue = user.management_id;

            const token = jwt.sign(
                { id: identityValue, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.cookie('authToken', token, cookieOptions);

            return res.status(200).json({
                message: "Login successful",
                role: user.role
            });
        } else {
            return res.status(401).json({ error: "Invalid credentials ❌" });
        }
    });
});

// --- GET USERS FOR MANAGEMENT ---
app.get('/api/users', (req, res) => {
    const roleReq = req.query.role; // e.g., 'driver'
    let sql = "";
    if (roleReq === 'driver') {
        sql = "SELECT driver_id, full_name as fullName, bus_number as busNumber, contact_number as contact, role FROM drivers";
    } else if (roleReq === 'student') {
        sql = "SELECT email_id, full_name as fullName, bus_id as busId, course, branch_semester as branchSem, contact_number as contact, role FROM students";
    } else {
        return res.status(400).json({ error: "Role needed" });
    }

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json(results);
    });
});

// --- TRACKING ---
app.get('/api/tracking', (req, res) => {
    db.query("SELECT * FROM bus_tracking", (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json(results);
    });
});

app.post('/api/tracking', (req, res) => {
    const { busNumber, distance, arrivalTime } = req.body;
    const sql = `INSERT INTO bus_tracking (bus_number, distance, arrival_time) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE distance=VALUES(distance), arrival_time=VALUES(arrival_time)`;
                 
    db.query(sql, [busNumber, distance, arrivalTime], (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.status(200).json({ message: "Updated tracking" });
    });
});

// --- ATTENDANCE ---
app.get('/api/attendance', (req, res) => {
    const { userId, type } = req.query;
    let sql = "SELECT * FROM attendance";
    let params = [];
    if (type) {
        sql += " WHERE attendance_type = ?";
        params.push(type);
    }
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB Error" });
        }
        // Format as { "YYYY-M-D": "status" } to match front-end
        const formatted = {};
        results.forEach(r => {
            formatted[r.date_str] = r.status;
        });
        res.json(formatted);
    });
});

app.post('/api/attendance', (req, res) => {
    const { userId, type, dateStr, status } = req.body;
    const sql = `INSERT INTO attendance (user_id, attendance_type, date_str, status)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status=VALUES(status)`;
    
    db.query(sql, [userId || "anonymous", type, dateStr, status], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB Error" });
        }
        res.status(200).json({ message: "Attendance saved" });
    });
});

// --- GENERIC REPORTS & COMPLAINTS ---
app.get('/api/reports', (req, res) => {
    const { type } = req.query;
    let sql = "SELECT * FROM generic_reports";
    let params = [];
    if (type) {
        sql += " WHERE report_type = ?";
        params.push(type);
    }
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json(results);
    });
});

app.post('/api/reports', (req, res) => {
    const { type, referenceId, data } = req.body;
    const sql = "INSERT INTO generic_reports (report_type, reference_id, data) VALUES (?, ?, ?)";
    db.query(sql, [type, referenceId, JSON.stringify(data || {})], (err) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.status(200).json({ message: "Saved" });
    });
});

// --- LOGOUT ---
app.post('/logout', (req, res) => {
    res.clearCookie('authToken', cookieOptions);
    res.status(200).json({ message: "Logged out" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});