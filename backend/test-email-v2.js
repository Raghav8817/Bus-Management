require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Transporter Error (Port 465):", error);
        
        // Try Port 587
        const transporter2 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        transporter2.verify((err2, success2) => {
            if (err2) {
                console.log("Transporter Error (Port 587):", err2);
            } else {
                console.log("Success on Port 587!");
            }
            process.exit();
        });
    } else {
        console.log("Success on Port 465!");
        process.exit();
    }
});
