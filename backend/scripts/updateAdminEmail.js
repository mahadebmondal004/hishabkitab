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

async function updateEmail() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        const newEmail = 'hishabkitab@codteg.com';

        await connection.query('UPDATE admins SET email = ? WHERE username = ?', [newEmail, 'admin']);
        console.log(`Updated admin email to: ${newEmail}`);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating email:', error);
        process.exit(1);
    }
}

updateEmail();
