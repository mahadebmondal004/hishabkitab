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

async function initAdmin() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Create table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Admins table created or already exists');

        // Check if admin exists
        const [rows] = await connection.query('SELECT * FROM admins WHERE username = ?', ['admin']);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', hashedPassword]);
            console.log('Default admin created: username=admin, password=admin123');
        } else {
            console.log('Admin user already exists');
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error initializing admin:', error);
        process.exit(1);
    }
}

initAdmin();
