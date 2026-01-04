const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function debugSystem() {
    console.log('--- DEBUG START ---');
    console.log('DB Host:', process.env.DB_HOST);
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('Target Email:', 'mahadebmondal004@gmail.com');

    // 1. Check Database
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('✅ Database Connection: SUCCESS');

        const [rows] = await connection.execute('SELECT * FROM admins WHERE email = ?', ['mahadebmondal004@gmail.com']);
        if (rows.length > 0) {
            console.log('✅ Admin User Found:', rows[0].username, rows[0].email);
        } else {
            console.log('❌ Admin User NOT FOUND in database!');
        }
        await connection.end();
    } catch (error) {
        console.log('❌ Database Connection FAILED:', error.message);
    }

    // 2. Check Email Sending
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            debug: true, // Show debug output
            logger: true // Log information to console
        });

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: `"Antigravity Debug" <${process.env.SMTP_USER}>`,
            to: 'mahadebmondal004@gmail.com',
            subject: "Debug Test Email",
            text: "If you receive this, SMTP is working correctly."
        });

        console.log('✅ Email Send SUCCESS:', info.messageId);
    } catch (error) {
        console.log('❌ Email Send FAILED:', error.message);
        if (error.code === 'EAUTH') console.log('   -> Check Username/Password');
        if (error.code === 'ESOCKET') console.log('   -> Check Host/Port/Firewall');
    }
    console.log('--- DEBUG END ---');
}

debugSystem();
