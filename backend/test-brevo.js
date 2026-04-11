require('dotenv').config();
const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

async function testBrevo() {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Brevo Test Email",
            sender: { "name": "WCTM Test", "email": "raghavsingh8817nitin@gmail.com" },
            to: [{ "email": "raghavsingh8817nitin@gmail.com" }],
            htmlContent: "<html><body><h1>Brevo is working!</h1></body></html>",
        });
        
        console.log('Brevo Test Success! Message ID:', result.messageId);
    } catch (error) {
        console.error('Brevo Test Error:', error.message);
    }
}

testBrevo();
