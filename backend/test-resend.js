require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'delivered@resend.dev', // Resend testing address
            subject: 'Resend Test',
            html: '<p>Resend is working!</p>'
        });

        if (error) {
            console.error('Resend Test Error:', error);
        } else {
            console.log('Resend Test Success! Email ID:', data.id);
        }
    } catch (err) {
        console.error('Resend Exception:', err);
    }
}

testResend();
