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

        // Add email column
        try {
            await connection.query(`ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE`);
            console.log('Added email column to users');
        } catch (e) {
            console.log('Email column might already exist:', e.message);
        }

        // Add verification status
        try {
            await connection.query(`ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE`);
            console.log('Added is_email_verified column');
        } catch (e) {
            console.log('is_email_verified column might already exist:', e.message);
        }

        // Add OTP columns
        try {
            await connection.query(`ALTER TABLE users ADD COLUMN email_otp VARCHAR(10)`);
            console.log('Added email_otp column');
        } catch (e) {
            console.log('email_otp column might already exist:', e.message);
        }

        try {
            await connection.query(`ALTER TABLE users ADD COLUMN email_otp_expires_at DATETIME`);
            console.log('Added email_otp_expires_at column');
        } catch (e) {
            console.log('email_otp_expires_at column might already exist:', e.message);
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
