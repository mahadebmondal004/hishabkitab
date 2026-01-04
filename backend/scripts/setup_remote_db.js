const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function setupDB() {
    try {
        console.log(`Connecting to ${dbConfig.host}...`);
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to remote database');

        // 1. Create Base Tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                mobile VARCHAR(15),
                pin_hash VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table users checked/created');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(100) NOT NULL,
                mobile VARCHAR(15),
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Table customers checked/created');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ledger_entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                entry_type ENUM('CREDIT', 'DEBIT') NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                note TEXT,
                entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
        `);
        console.log('Table ledger_entries checked/created');

        // 2. Create Admin Table with OTP columns
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                otp VARCHAR(10),
                otp_expires_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table admins checked/created');

        // 3. Insert/Update Admin User
        const adminEmail = 'mahadebmondal004@gmail.com';
        const [rows] = await connection.query('SELECT * FROM admins WHERE username = ?', ['admin']);

        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(
                'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
                ['admin', adminEmail, hashedPassword]
            );
            console.log(`Admin user created with email: ${adminEmail}`);
        } else {
            await connection.query('UPDATE admins SET email = ? WHERE username = ?', [adminEmail, 'admin']);
            console.log(`Admin user updated with email: ${adminEmail}`);
        }

        await connection.end();
        console.log('Setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up remote DB:', error);
        process.exit(1);
    }
}

setupDB();
