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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});