const db = require('../src/config/db');

async function updateSchema() {
    try {
        console.log('Updating users table schema...');

        const columnsToAdd = [
            'ADD COLUMN IF NOT EXISTS business_name VARCHAR(255)',
            'ADD COLUMN IF NOT EXISTS email VARCHAR(255)',
            'ADD COLUMN IF NOT EXISTS business_address TEXT',
            'ADD COLUMN IF NOT EXISTS business_category VARCHAR(100)',
            'ADD COLUMN IF NOT EXISTS business_type VARCHAR(100)',
            'ADD COLUMN IF NOT EXISTS gstin VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100)',
            'ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)'
        ];

        for (const column of columnsToAdd) {
            try {
                await db.query(`ALTER TABLE users ${column}`);
                console.log(`Executed: ${column}`);
            } catch (err) {
                // Ignore if duplicate column error (though IF NOT EXISTS should handle it on newer MySQL)
                console.log(`Skipped/Error: ${column} - ${err.message}`);
            }
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
