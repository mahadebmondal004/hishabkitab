const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Connected to database...');

    try {
        // Add columns if they don't exist
        // Using a try-catch block for each alteration is a simple way to handle "Duplicate column" errors if ran multiple times

        try {
            await connection.query("ALTER TABLE users ADD COLUMN email VARCHAR(255)");
            console.log("Added email column");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
            else console.log("email column already exists");
        }

        try {
            await connection.query("ALTER TABLE users ADD COLUMN business_name VARCHAR(255)");
            console.log("Added business_name column");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
            else console.log("business_name column already exists");
        }

        try {
            await connection.query("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500)");
            console.log("Added profile_picture column");
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
            else console.log("profile_picture column already exists");
        }

        console.log('Schema update complete.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await connection.end();
    }
}

updateSchema().catch(console.error);
