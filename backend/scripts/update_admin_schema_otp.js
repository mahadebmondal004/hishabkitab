const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function updateSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Add email column if not exists
        try {
            await connection.query(`ALTER TABLE admins ADD COLUMN email VARCHAR(100) UNIQUE AFTER username`);
            console.log('Added email column');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Email column might already exist:', e.message);
        }

        // Add otp column
        try {
            await connection.query(`ALTER TABLE admins ADD COLUMN otp VARCHAR(10) AFTER password_hash`);
            console.log('Added otp column');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('OTP column might already exist:', e.message);
        }

        // Add otp_expires_at column
        try {
            await connection.query(`ALTER TABLE admins ADD COLUMN otp_expires_at DATETIME AFTER otp`);
            console.log('Added otp_expires_at column');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('otp_expires_at column might already exist:', e.message);
        }

        // Update default admin email
        // IMPORTANT: You should change this email to your real email to receive OTPs
        const defaultEmail = 'mahadebtraders@gmail.com';
        await connection.query('UPDATE admins SET email = ? WHERE username = ?', [defaultEmail, 'admin']);
        console.log(`Updated default admin 'admin' with email: ${defaultEmail}`);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
