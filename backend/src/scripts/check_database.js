const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkDatabase() {
    console.log('🔍 Connecting to Remote Database...\n');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}\n`);

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database successfully!\n');

        // Get all tables
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        console.log('📊 EXISTING TABLES IN DATABASE:');
        console.log('================================\n');
        tableNames.forEach((table, index) => {
            console.log(`${index + 1}. ${table}`);
        });
        console.log(`\nTotal Tables: ${tableNames.length}\n`);

        // Expected tables based on code analysis
        const expectedTables = [
            'users',
            'customers',
            'ledger_entries',
            'balances',
            'products',
            'invoices',
            'invoice_items',
            'staff',
            'cashbook_entries',
            'categories',
            'collections',
            'tickets',
            'admin_users',
            'cms_content',
            'seo_settings'
        ];

        // Check for missing tables
        const missingTables = expectedTables.filter(table => !tableNames.includes(table));

        if (missingTables.length > 0) {
            console.log('❌ MISSING TABLES:');
            console.log('==================\n');
            missingTables.forEach((table, index) => {
                console.log(`${index + 1}. ${table}`);
            });
            console.log(`\nTotal Missing: ${missingTables.length}\n`);
        } else {
            console.log('✅ All expected tables exist!\n');
        }

        // Check for extra tables (not in expected list)
        const extraTables = tableNames.filter(table => !expectedTables.includes(table));
        if (extraTables.length > 0) {
            console.log('ℹ️  EXTRA TABLES (not in expected list):');
            console.log('========================================\n');
            extraTables.forEach((table, index) => {
                console.log(`${index + 1}. ${table}`);
            });
            console.log(`\nTotal Extra: ${extraTables.length}\n`);
        }

        // Get detailed structure for each existing table
        console.log('📋 TABLE STRUCTURES:');
        console.log('====================\n');

        for (const tableName of tableNames) {
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            console.log(`\n📌 ${tableName.toUpperCase()}`);
            console.log('-'.repeat(80));
            console.log('Field'.padEnd(25) + 'Type'.padEnd(20) + 'Null'.padEnd(10) + 'Key'.padEnd(10) + 'Default');
            console.log('-'.repeat(80));
            columns.forEach(col => {
                console.log(
                    String(col.Field).padEnd(25) +
                    String(col.Type).padEnd(20) +
                    String(col.Null).padEnd(10) +
                    String(col.Key).padEnd(10) +
                    String(col.Default || 'NULL')
                );
            });

            // Get row count
            const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`\n📊 Total Rows: ${countResult[0].count}`);
        }

        console.log('\n\n✅ Database check completed!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ENOTFOUND') {
            console.error('   → Cannot reach database host. Check your internet connection.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   → Access denied. Check your database credentials.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   → Database does not exist.');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed.\n');
        }
    }
}

checkDatabase();
