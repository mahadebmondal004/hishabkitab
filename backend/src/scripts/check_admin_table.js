const db = require('../config/db');

async function checkAdminTable() {
    try {
        console.log('Checking admin_users table structure...\n');

        const [cols] = await db.execute('DESCRIBE admin_users');
        console.log('admin_users columns:');
        cols.forEach(c => {
            console.log(`  ${c.Field.padEnd(20)} ${c.Type.padEnd(20)} ${c.Null} ${c.Key} ${c.Default || 'NULL'}`);
        });

        console.log('\nChecking for admins table...');
        try {
            const [adminsCols] = await db.execute('DESCRIBE admins');
            console.log('\n✅ admins table exists!');
            console.log('admins columns:');
            adminsCols.forEach(c => {
                console.log(`  ${c.Field.padEnd(20)} ${c.Type.padEnd(20)} ${c.Null} ${c.Key} ${c.Default || 'NULL'}`);
            });
        } catch (e) {
            console.log('❌ admins table does NOT exist');
            console.log('   Controller expects "admins" but database has "admin_users"');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAdminTable();
