const express=require('express')
const app=express()
const cors=require('cors')
const db=require('./config/db')
const jwt=require("jsonwebtoken")
const cookieparser=require('cookie-parser')

app.use(cors({
    origin: ["http://localhost:5173", "https://your-frontend.vercel.app"], // Add Vercel URL later
    credentials: true
}));
app.use(express.json())
app.use(cookieparser())

// Example Express route
app.get('/verify', (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).send();

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send();

        // Ensure you are sending the role back here!
        res.json({ isAuth:true,role: decoded.role });
    });
});

// Inside your backend app.js

// --- server.js ---
app.get('/user-data', (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ error: "No token found" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });

        // DEBUG: See what is inside your token in the terminal
        console.log("Token Decoded:", decoded);

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
                // If this triggers, the ID in the token doesn't exist in the table
                console.log(`User not found for ID: ${decoded.id} in ${decoded.role} table`);
                res.status(404).json({ error: "User not found" });
            }
        });
    });
});

app.post('/signup', (req, res) => {
    const {
        role, fullName, password, email, contact, address,
        studentBusId, course, branchSem,
        driverId, busId, busNumber,
        managementId
    } = req.body;

    let sql = "";
    let values = [];
    let userIdForToken = ""; // Variable to hold the ID for the JWT

    if (role === "student") {
        sql = `INSERT INTO students (full_name, bus_id, course, branch_semester, contact_number, email_id, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        values = [fullName, studentBusId, course, branchSem, contact, email, address, password];
        userIdForToken = email; // Use email as the identifier
    } else if (role === "driver") {
        sql = `INSERT INTO drivers (full_name, driver_id, bus_id, bus_number, contact_number, address, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        values = [fullName, driverId, busId, busNumber, contact, address, password];
        userIdForToken = driverId;
    } else if (role === "management") {
        sql = `INSERT INTO management (management_id, full_name, email_id, address, password) VALUES (?, ?, ?, ?, ?)`;
        values = [managementId, fullName, email, address, password];
        userIdForToken = managementId;
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Signup Error:", err.message);
            return res.status(500).json({ error: "Database error during signup" });
        }

        // SIGN THE TOKEN with the actual ID and Role
        const token = jwt.sign(
            { id: userIdForToken, role: role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false, // Laptop dev (no HTTPS)
            sameSite: 'lax',
            maxAge: 86400000
        });

        // Send role back so frontend knows where to navigate
        res.status(201).json({
            message: "Success",
            role: role
        });
    });
});

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

            // --- FIX START: Correctly identify the ID column based on role ---
            let identityValue;
            if (role === "student") identityValue = user.email_id;
            else if (role === "driver") identityValue = user.driver_id;
            else if (role === "management") identityValue = user.management_id;
            // --- FIX END ---

            // Create Token using the actual ID from the DB
            const token = jwt.sign(
                { id: identityValue, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            // Set Cookie
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: false, // Set true only if using HTTPS
                sameSite: 'lax',
                maxAge: 86400000 // 1 day
            });

            return res.status(200).json({
                message: "Login successful",
                role: user.role
            });
        } else {
            return res.status(401).json({ error: "Invalid credentials ❌" });
        }
    });
});

app.listen(3000)