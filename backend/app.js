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

// --- AUTH MIDDLEWARE (Put this above your routes) ---
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // We attach the decoded data (id, role) to the 'req' object
        // so the next function in the chain can use it
        req.user = decoded;

        // 'next()' tells Express to move to the actual route handler
        next();
    });
};

// Helper for dynamic cookie settings based on environment
const cookieOptions = {
    httpOnly: true,
    // If not in production, secure must be false for localhost to accept it
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/', // Critical: ensures the cookie is sent for all routes like /verify
    maxAge: 86400000
};
// --- AUTH VERIFICATION ---
app.get('/verify', (req, res) => {
    const token = req.cookies.authToken;
    // Always send a JSON object so res.json() doesn't crash on the frontend
    if (!token) return res.status(401).json({ isAuth: false, message: "No token" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ isAuth: false, message: "Invalid token" });
        res.json({ isAuth: true, role: decoded.role });
    });
});

// --- GET USER PROFILE DATA ---
// Optimized user-data route using your middleware
app.get('/user-data', verifyAdmin, (req, res) => {
    const { id, role } = req.user; // Provided by verifyAdmin

    let sql = "";
    if (role === 'student') {
        sql = "SELECT * FROM students WHERE email_id = ?";
    } else if (role === 'driver') {
        sql = "SELECT * FROM drivers WHERE driver_id = ?";
    } else if (role === 'management') {
        sql = "SELECT * FROM management WHERE management_id = ?";
    }

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
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
    let userIdForToken = ""; // Currently stays empty!

    if (role === "student") {
        sql = `INSERT INTO students (full_name, bus_id, course, branch_semester, contact_number, email_id, address, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student')`;
        values = [fullName, studentBusId, course, branchSem, contact, email, address, password];
        userIdForToken = email; // ✅ FIX: Assign email to token ID
    } else if (role === "driver") {
        sql = `INSERT INTO drivers (full_name, driver_id, bus_id, bus_number, contact_number, address, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'driver')`;
        values = [fullName, driverId, busId, busNumber, contact, address, password];
        userIdForToken = driverId; // ✅ FIX: Assign driverId to token ID
    } else if (role === "management") {
        sql = `INSERT INTO management (management_id, full_name, email_id, address, password, role) VALUES (?, ?, ?, ?, ?, 'management')`;
        values = [managementId, fullName, email, address, password];
        userIdForToken = managementId; // ✅ FIX: Assign managementId to token ID
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Signup Error:", err.message);
            return res.status(500).json({ error: "Database error during signup" });
        }

        // Now userIdForToken actually has a value (e.g., "test@gmail.com")
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
// --- LOGIN ---
app.post('/login', (req, res) => {
    const { role, password } = req.body;

    // Use email_id for students, and id for others. 
    // Fallback to req.body.id if email_id is missing to be safe.
    const identifier = (role === 'student') ? (req.body.email_id || req.body.id) : req.body.id;

    if (!identifier || !password) {
        return res.status(400).json({ error: "Credentials missing" });
    }

    let sql = "";
    if (role === 'student') {
        sql = "SELECT * FROM students WHERE email_id = ? AND password = ?";
    } else if (role === 'driver') {
        sql = "SELECT * FROM drivers WHERE driver_id = ? AND password = ?";
    } else {
        sql = "SELECT * FROM management WHERE management_id = ? AND password = ?";
    }

    db.query(sql, [identifier, password], (err, results) => {
        if (err) {
            console.error("Login DB Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            const token = jwt.sign(
                { id: identifier, role: role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.cookie('authToken', token, cookieOptions);
            res.json({ message: "Login successful", role });
        } else {
            res.status(401).json({ error: "Invalid Credentials" });
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
//-----------bus driver gets students data---------------------
// GET students assigned to a specific bus
app.get('/api/bus-students/:busId', verifyAdmin, (req, res) => {
    const busId = req.params.busId;

    // We select the columns from your 'students' table
    // We use 'AS' to make the names match your React state (fullName)
    const sql = `
        SELECT 
            full_name AS fullName, 
            email_id AS email, 
            address AS stop, 
            contact_number AS contact 
        FROM students 
        WHERE bus_id = ?
    `;

    db.query(sql, [busId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Even if results is empty [], we send 200 OK so the frontend knows there are 0 students
        res.status(200).json(results);
    });
});

//--------------bus location------------
// GET the current location of a specific bus
app.get('/api/bus-location/:busId', verifyAdmin, (req, res) => {
    const busId = req.params.busId;

    // Join with drivers table to get their name and phone
    const sql = `
        SELECT latitude, longitude, full_name, contact_number, bus_id 
        FROM drivers 
        WHERE bus_id = ?
    `;

    db.query(sql, [busId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ error: "No bus found" });
        res.json(result[0]);
    });
});
// Update Bus Location (Called by Driver)
app.post('/api/update-location', verifyAdmin, (req, res) => {
    const { latitude, longitude } = req.body;
    const driverId = req.user.id; // From JWT

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Coordinates required" });
    }

    const sql = "UPDATE drivers SET latitude = ?, longitude = ? WHERE driver_id = ?";

    db.query(sql, [latitude, longitude, driverId], (err, result) => {
        if (err) {
            console.error("Location Update Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Location updated" });
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