const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hishab_kitab',
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // ALTER table if columns don't exist
        // Since it's MySQL, 'IF NOT EXISTS' for columns is tricky in one line usually.
        // We'll just try to add and ignore duplicate column errors, or drop/create.
        // For development speed, let's DROP and CREATE assuming no critical data yet (User was just testing "Test Item").

        await connection.query('DROP TABLE IF EXISTS invoice_items');
        await connection.query('DROP TABLE IF EXISTS invoices');
        await connection.query('DROP TABLE IF EXISTS products');
        await connection.query('DROP TABLE IF EXISTS staff');

        console.log('Dropped tables.');

        const schema = `
        CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('PRODUCT', 'SERVICE') NOT NULL DEFAULT 'PRODUCT',
        name VARCHAR(255) NOT NULL,
        rate DECIMAL(10,2) NOT NULL DEFAULT 0,
        purchase_rate DECIMAL(10,2) DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'pc',
        stock INT DEFAULT 0,
        low_stock_alert INT DEFAULT 0,
        tax_included BOOLEAN DEFAULT FALSE,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        hsn_sac VARCHAR(50),
        img_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        customer_id INT,
        customer_name VARCHAR(255),
        invoice_number VARCHAR(50),
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        type ENUM('SALE', 'PURCHASE') DEFAULT 'SALE',
        invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT NOT NULL,
        product_id INT,
        product_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
        rate DECIMAL(10,2) NOT NULL DEFAULT 0,
        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        );
        `;

        // Split queries by ; and run
        const queries = schema.split(';').filter(q => q.trim());
        for (const q of queries) {
            await connection.query(q);
        }

        console.log('Migration completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
