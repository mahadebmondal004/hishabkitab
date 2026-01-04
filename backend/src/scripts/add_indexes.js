const db = require('../config/db');
const logger = require('../utils/logger');

async function addDatabaseIndexes() {
    console.log('🔧 Adding database indexes for performance optimization...\n');

    const indexes = [
        {
            table: 'customers',
            name: 'idx_user_id',
            column: 'user_id',
            sql: 'ALTER TABLE customers ADD INDEX idx_user_id (user_id)'
        },
        {
            table: 'ledger_entries',
            name: 'idx_customer_date',
            column: 'customer_id, entry_date',
            sql: 'ALTER TABLE ledger_entries ADD INDEX idx_customer_date (customer_id, entry_date)'
        },
        {
            table: 'products',
            name: 'idx_user_id',
            column: 'user_id',
            sql: 'ALTER TABLE products ADD INDEX idx_user_id (user_id)'
        },
        {
            table: 'invoices',
            name: 'idx_user_date',
            column: 'user_id, invoice_date',
            sql: 'ALTER TABLE invoices ADD INDEX idx_user_date (user_id, invoice_date)'
        },
        {
            table: 'cashbook_entries',
            name: 'idx_user_date',
            column: 'user_id, entry_date',
            sql: 'ALTER TABLE cashbook_entries ADD INDEX idx_user_date (user_id, entry_date)'
        },
        {
            table: 'cashbook_entries',
            name: 'idx_user_category',
            column: 'user_id, category',
            sql: 'ALTER TABLE cashbook_entries ADD INDEX idx_user_category (user_id, category)'
        },
        {
            table: 'staff',
            name: 'idx_user_id',
            column: 'user_id',
            sql: 'ALTER TABLE staff ADD INDEX idx_user_id (user_id)'
        },
        {
            table: 'support_tickets',
            name: 'idx_user_status',
            column: 'user_id, status',
            sql: 'ALTER TABLE support_tickets ADD INDEX idx_user_status (user_id, status)'
        }
    ];

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const index of indexes) {
        try {
            // Check if index already exists
            const [existingIndexes] = await db.execute(
                `SHOW INDEX FROM ${index.table} WHERE Key_name = ?`,
                [index.name]
            );

            if (existingIndexes.length > 0) {
                console.log(`⏭️  Index ${index.name} on ${index.table} already exists - skipping`);
                skipCount++;
                continue;
            }

            // Add the index
            await db.execute(index.sql);
            console.log(`✅ Added index ${index.name} on ${index.table}(${index.column})`);
            logger.info('Database index added', {
                table: index.table,
                index: index.name,
                column: index.column
            });
            successCount++;

        } catch (error) {
            console.error(`❌ Failed to add index ${index.name} on ${index.table}:`, error.message);
            logger.error('Failed to add database index', {
                table: index.table,
                index: index.name,
                error: error.message
            });
            errorCount++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully added: ${successCount}`);
    console.log(`   ⏭️  Already existed: ${skipCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total indexes: ${indexes.length}\n`);

    if (errorCount === 0) {
        console.log('🎉 All indexes processed successfully!\n');
    } else {
        console.log('⚠️  Some indexes failed to add. Check the logs for details.\n');
    }

    process.exit(errorCount > 0 ? 1 : 0);
}

// Run the migration
addDatabaseIndexes().catch(error => {
    console.error('❌ Migration failed:', error);
    logger.error('Database index migration failed', { error: error.message });
    process.exit(1);
});
