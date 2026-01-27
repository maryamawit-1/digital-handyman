require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSend() {
    console.log("1. Loading Credentials...");
    console.log("User:", process.env.EMAIL_USER);
    // Don't log the full password, just check if it exists
    console.log("Pass:", process.env.EMAIL_PASS ? "****Exists****" : "MISSING");

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log("2. Verifying Connection...");
        await transporter.verify();
        console.log("✅ Connection Successful!");

        console.log("3. Sending Test Email...");
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: "Test Email from Handyman App",
            text: "If you see this, your email logic is working!"
        });

        console.log("🎉 Email sent: " + info.response);
    } catch (error) {
        console.error("❌ ERROR FAILED:");
        console.error(error);
    }
}

testSend();