require('dotenv').config(); // MUST be at the top to read JWT_SECRET and DATABASE_URL
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./config/db');
const jwt = require("jsonwebtoken");
const cookieparser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// 1. DYNAMIC CORS: Replace with your actual Vercel URL
app.use(cors({
    origin: (origin, callback) => {
        // Log incoming origin for debugging in Render dashboard
        console.log(`[CORS Check] Incoming Origin: ${origin}`);

        const allowedOrigins = [
            "http://localhost:5173", 
            "http://localhost:3000",
            "https://bus-management-sooty.vercel.app" // Hardcoded safety
        ];
        
        // Add FRONTEND_URL if exists
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }

        // Normalize: lowercase and remove trailing slashes from all
        const normalizedAllowed = allowedOrigins.map(url => 
            url ? url.toLowerCase().replace(/\/$/, "") : url
        );
        const normalizedOrigin = origin ? origin.toLowerCase().replace(/\/$/, "") : origin;

        if (!origin || normalizedAllowed.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS Rejected] Origin: ${origin} | Not in: [${normalizedAllowed}]`);
            callback(null, false);
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieparser());

// ── In-memory trip status store (busId → { active, updatedAt }) ─────────────
const tripStatusStore = new Map();

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
    secure: true, // Always true for cross-site cookies on Render/Vercel
    sameSite: 'none', // Required for cross-domain cookies
    path: '/',
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

// --- UPDATE USER PROFILE DATA ---
app.put('/api/user-data', verifyAdmin, (req, res) => {
    const { id, role } = req.user;
    const { fullName, busId, course, branchSem, contact, address, profileImage } = req.body;

    let sql = "";
    let params = [];

    if (role === 'student') {
        sql = `UPDATE students SET 
                full_name = ?, bus_id = ?, course = ?, branch_semester = ?, 
                contact_number = ?, address = ?, profile_image = ? 
               WHERE email_id = ?`;
        params = [fullName, busId, course, branchSem, contact, address, profileImage, id];
    } else if (role === 'driver') {
        sql = `UPDATE drivers SET 
                full_name = ?, bus_id = ?, bus_number = ?, contact_number = ?, 
                address = ?, profile_image = ? 
               WHERE driver_id = ?`;
        // In the Account form for drivers, we might use busId as the physical number or ID
        params = [fullName, busId, busId, contact, address, profileImage, id];
    } else if (role === 'management') {
        sql = `UPDATE management SET 
                full_name = ?, address = ?, profile_image = ? 
               WHERE management_id = ?`;
        params = [fullName, address, profileImage, id];
    } else {
        return res.status(400).json({ error: "Invalid role" });
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ error: "Database update failed" });
        }
        res.json({ message: "Profile updated successfully" });
    });
});

// --- NEW: FETCH SPECIFIC USER DETAIL ---
app.get('/api/management/user/:role/:userId', verifyAdmin, (req, res) => {
    const { role, userId } = req.params;
    let sql = "";
    if (role === 'student') sql = "SELECT * FROM students WHERE email_id = ?";
    else if (role === 'driver') sql = "SELECT * FROM drivers WHERE driver_id = ?";
    else return res.status(400).json({ error: "Invalid role" });

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length > 0) res.json(results[0]);
        else res.status(404).json({ error: "User not found" });
    });
});

// --- NEW: FETCH ATTENDANCE BY BUS ---
app.get('/api/management/attendance/bus/:busNumber', verifyAdmin, (req, res) => {
    const { busNumber } = req.params;
    // Joining with students to get names of those who boarded
    const sql = `
        SELECT a.*, s.full_name 
        FROM attendance a
        JOIN students s ON a.user_id = s.email_id
        WHERE s.bus_id = ?
        ORDER BY a.date_str DESC, a.id DESC
    `;
    db.query(sql, [busNumber], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

// --- NEW: SITE CONFIG ---
app.get('/api/site-config', (req, res) => {
    db.query("SELECT * FROM site_config", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        const config = {};
        results.forEach(row => {
            config[row.config_key] = row.config_value;
        });
        res.json(config);
    });
});

// --- SIGNUP ---
// --- SIGNUP (SECURE) ---
app.post('/signup', async (req, res) => {
    const {
        role, fullName, password, email, contact, address,
        studentBusId, course, branchSem,
        driverId, busId, busNumber,
        managementId
    } = req.body;

    try {
        // 1. Check for basic duplication (User ID / Email)
        let checkSql = "";
        let checkVal = "";
        if (role === 'student') { checkSql = "SELECT * FROM students WHERE email_id = ?"; checkVal = email; }
        else if (role === 'driver') { checkSql = "SELECT * FROM drivers WHERE driver_id = ?"; checkVal = driverId; }
        else if (role === 'management') { checkSql = "SELECT * FROM management WHERE management_id = ?"; checkVal = managementId; }

        const existingUser = await new Promise((resolve) => db.query(checkSql, [checkVal], (e, r) => resolve(r)));
        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ error: "User ID or Email already registered" });
        }

        // 2. SPECIFIC: Check if Bus is already assigned (Driver Only)
        if (role === 'driver') {
            const busCheckSql = "SELECT full_name FROM drivers WHERE bus_id = ? OR bus_number = ?";
            const assignedDriver = await new Promise((resolve) => db.query(busCheckSql, [busId, busNumber], (e, r) => resolve(r)));
            if (assignedDriver && assignedDriver.length > 0) {
                return res.status(400).json({ error: `Bus ${busNumber} is already assigned to driver: ${assignedDriver[0].full_name}` });
            }
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insert
        let sql = "";
        let values = [];
        let userIdForToken = "";

        if (role === "student") {
            sql = `INSERT INTO students (full_name, bus_id, course, branch_semester, contact_number, email_id, address, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student')`;
            values = [fullName, studentBusId, course, branchSem, contact, email, address, hashedPassword];
            userIdForToken = email;
        } else if (role === "driver") {
            sql = `INSERT INTO drivers (full_name, driver_id, bus_id, bus_number, contact_number, address, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'driver')`;
            values = [fullName, driverId, busId, busNumber, contact, address, hashedPassword];
            userIdForToken = driverId;
        } else if (role === "management") {
            sql = `INSERT INTO management (management_id, full_name, email_id, address, password, role) VALUES (?, ?, ?, ?, ?, 'management')`;
            values = [managementId, fullName, email, address, hashedPassword];
            userIdForToken = managementId;
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Insert Error:", err.message);
                return res.status(500).json({ error: "Database error" });
            }
            const token = jwt.sign({ id: userIdForToken, role: role }, process.env.JWT_SECRET, { expiresIn: "1d" });
            res.cookie('authToken', token, cookieOptions);
            res.status(201).json({ message: "Success", role: role });
        });

    } catch (err) {
        console.error("Signup Processing Error:", err);
        res.status(500).json({ error: "Security processing failed" });
    }
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
    if (role === 'student') sql = "SELECT * FROM students WHERE email_id = ?";
    else if (role === 'driver') sql = "SELECT * FROM drivers WHERE driver_id = ?";
    else sql = "SELECT * FROM management WHERE management_id = ?";

    db.query(sql, [identifier], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (isMatch) {
                const token = jwt.sign({ id: identifier, role: role }, process.env.JWT_SECRET, { expiresIn: "1d" });
                res.cookie('authToken', token, cookieOptions);
                res.json({ message: "Login successful", role });
            } else {
                res.status(401).json({ error: "Invalid Credentials" });
            }
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

// ── MANAGEMENT OVERVIEW (Consolidated data for dashboards) ──────────────────
app.get('/api/management/overview', verifyAdmin, (req, res) => {
    // Only management can see this
    if (req.user.role !== 'management') return res.status(403).json({ error: "Unauthorized" });

    const today = new Date().toISOString().split('T')[0];

    // Complex query: Get drivers + count students + count present students
    const sql = `
        SELECT 
            d.bus_id as busId,
            d.bus_number as busNumber,
            d.full_name as fullName,
            d.contact_number as contact,
            d.latitude,
            d.longitude,
            d.route,
            d.waypoints,
            d.last_updated as lastUpdated,
            (SELECT COUNT(*) FROM students s WHERE s.bus_id = d.bus_id) as totalStudents,
            (SELECT COUNT(*) FROM attendance a 
             JOIN students s2 ON s2.email_id = a.user_id 
             WHERE s2.bus_id = d.bus_id AND a.date_str = ? AND a.status = 'present') as presentStudents
        FROM drivers d
    `;

    db.query(sql, [today], (err, buses) => {
        if (err) {
            console.error("Overview Query Error:", err);
            return res.status(500).json({ error: "DB Error" });
        }

        // Attach in-memory trip statuses
        const enrichedBuses = buses.map(bus => {
            const status = tripStatusStore.get(String(bus.busId));
            return {
                ...bus,
                tripActive: status?.active || false,
                lastTripUpdate: status?.updatedAt || null
            };
        });

        // Global stats
        db.query("SELECT COUNT(*) as total FROM students", (err2, sCount) => {
            const totalStudentsAll = sCount ? sCount[0].total : 0;
            const totalPresentAll = enrichedBuses.reduce((sum, b) => sum + b.presentStudents, 0);
            const ongoingTripsAll = enrichedBuses.filter(b => b.tripActive).length;

            res.json({
                buses: enrichedBuses,
                summary: {
                    totalBuses: enrichedBuses.length,
                    totalStudents: totalStudentsAll,
                    totalPresent: totalPresentAll,
                    totalAbsent: totalStudentsAll - totalPresentAll,
                    ongoingTrips: ongoingTripsAll
                }
            });
        });
    });
});

// Update Driver Route Path & Name
app.patch('/api/management/driver-route', verifyAdmin, (req, res) => {
    if (req.user.role !== 'management') return res.status(403).json({ error: "Unauthorized" });
    const { busId, route, waypoints } = req.body;
    if (!busId) return res.status(400).json({ error: "Bus ID required" });
    const sql = "UPDATE drivers SET route = ?, waypoints = ? WHERE bus_id = ?";
    db.query(sql, [route, JSON.stringify(waypoints), busId], (err, result) => {
        if (err) {
            console.error("Update Route Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Route updated successfully" });
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
// ── TRIP STATUS (Driver sets it, Student reads it) ──────────────────────────
// Driver: POST /api/trip-status  { active: true/false }
app.post('/api/trip-status', verifyAdmin, (req, res) => {
    const { active } = req.body;
    const driverId = req.user.id;

    db.query('SELECT bus_id FROM drivers WHERE driver_id = ?', [driverId], (err, results) => {
        if (err || !results.length) return res.status(500).json({ error: 'DB error' });
        const busId = String(results[0].bus_id);
        tripStatusStore.set(busId, { active: !!active, updatedAt: new Date() });
        console.log(`Trip status for bus ${busId}: ${active ? 'STARTED' : 'ENDED'}`);
        res.json({ success: true, busId, active });
    });
});

// Student: GET /api/trip-status/:busId
app.get('/api/trip-status/:busId', verifyAdmin, (req, res) => {
    const busId = String(req.params.busId);
    const status = tripStatusStore.get(busId);
    res.json({ active: status?.active || false, updatedAt: status?.updatedAt || null });
});

// ── AUTO-ATTENDANCE (Student proximity-based) ─────────────────────────────────
// POST /api/auto-attendance  { type: 'morning'|'evening', dateStr: 'YYYY-MM-DD' }
app.post('/api/auto-attendance', verifyAdmin, (req, res) => {
    const userId = req.user.id; // student's email from JWT
    const { type, dateStr } = req.body;

    if (!type || !dateStr) return res.status(400).json({ error: 'type and dateStr required' });

    // Check if already marked today
    const checkSql = 'SELECT id FROM attendance WHERE user_id = ? AND attendance_type = ? AND date_str = ?';
    db.query(checkSql, [userId, type, dateStr], (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (results.length > 0) {
            return res.json({ alreadyMarked: true, message: 'Already marked for today' });
        }

        // Insert present
        const insertSql = `INSERT INTO attendance (user_id, attendance_type, date_str, status) VALUES (?, ?, ?, 'present')`;
        db.query(insertSql, [userId, type, dateStr], (err2) => {
            if (err2) {
                console.error('Auto-attendance insert error:', err2);
                return res.status(500).json({ error: 'DB error' });
            }
            console.log(`Auto-attendance: ${userId} marked present for ${type} on ${dateStr}`);
            res.json({ alreadyMarked: false, message: 'Attendance auto-marked as present!' });
        });
    });
});

// ── TODAY'S ATTENDANCE for all students on a bus (Driver dashboard) ───────────
// GET /api/bus-attendance/:busId
app.get('/api/bus-attendance/:busId', verifyAdmin, (req, res) => {
    const busId = req.params.busId;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Join attendance with students to get today's status for each student on this bus
    const sql = `
        SELECT 
            s.email_id  AS email,
            s.full_name AS fullName,
            COALESCE(a.status, 'absent') AS status,
            a.attendance_type
        FROM students s
        LEFT JOIN attendance a 
            ON a.user_id = s.email_id 
            AND a.date_str = ?
        WHERE s.bus_id = ?
    `;

    db.query(sql, [today, busId], (err, results) => {
        if (err) {
            console.error('Bus attendance error:', err);
            return res.status(500).json({ error: 'DB error' });
        }
        res.json(results);
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