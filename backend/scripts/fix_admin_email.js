const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: '127.0.0.1', // Force IPv4
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function updateEmail() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        const newEmail = 'mahadebmondal004@gmail.com';

        // Update the email for the 'admin' user
        const [result] = await connection.query('UPDATE admins SET email = ? WHERE username = ?', [newEmail, 'admin']);

        if (result.affectedRows > 0) {
            console.log(`SUCCESS: Admin email updated to: ${newEmail}`);
        } else {
            // If username 'admin' doesn't exist for some reason, insert it or check id 1
            console.log("Admin 'admin' not found, trying ID 1...");
            await connection.query('UPDATE admins SET email = ? WHERE id = 1', [newEmail]);
            console.log(`SUCCESS: Admin ID 1 email updated to: ${newEmail}`);
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating email:', error);
        process.exit(1);
    }
}

updateEmail();
