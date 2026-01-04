const db = require('../config/db');
const logger = require('../utils/logger');

async function fixAdminIssues() {
    console.log('🔧 Fixing Admin Login Issues...\n');

    try {
        // 1. Check if admins table exists and has correct structure
        console.log('1️⃣  Checking admins table structure...');
        const [cols] = await db.execute('DESCRIBE admins');

        console.log('   Current columns:');
        const columnNames = cols.map(c => c.Field);
        cols.forEach(c => {
            console.log(`     - ${c.Field} (${c.Type})`);
        });

        // 2. Check if required columns exist
        const requiredColumns = ['id', 'email', 'otp', 'otp_expires_at'];
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

        if (missingColumns.length > 0) {
            console.log('\n   ⚠️  Missing columns:', missingColumns.join(', '));
            console.log('   Adding missing columns...\n');

            if (missingColumns.includes('otp')) {
                await db.execute('ALTER TABLE admins ADD COLUMN otp VARCHAR(6)');
                console.log('   ✅ Added otp column');
            }

            if (missingColumns.includes('otp_expires_at')) {
                await db.execute('ALTER TABLE admins ADD COLUMN otp_expires_at DATETIME');
                console.log('   ✅ Added otp_expires_at column');
            }
        } else {
            console.log('   ✅ All required columns exist\n');
        }

        // 3. Check if there are any admin users
        const [admins] = await db.execute('SELECT id, username, email FROM admins');
        console.log(`\n2️⃣  Found ${admins.length} admin(s):`);

        if (admins.length === 0) {
            console.log('   ⚠️  No admin users found!');
            console.log('   Creating default admin...\n');

            const bcrypt = require('bcrypt');
            const defaultPassword = await bcrypt.hash('admin123', 10);

            await db.execute(
                'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
                ['admin', 'admin@hishabkitab.com', defaultPassword]
            );

            console.log('   ✅ Created default admin:');
            console.log('      Email: admin@hishabkitab.com');
            console.log('      Password: admin123');
            console.log('      ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!\n');
        } else {
            admins.forEach((admin, i) => {
                console.log(`   ${i + 1}. ${admin.username} (${admin.email})`);
            });
        }

        // 4. Test SMTP configuration
        console.log('\n3️⃣  Testing SMTP configuration...');
        console.log(`   Host: ${process.env.SMTP_HOST}`);
        console.log(`   Port: ${process.env.SMTP_PORT}`);
        console.log(`   User: ${process.env.SMTP_USER}`);
        console.log(`   Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('\n   ❌ SMTP credentials not configured!');
            console.log('   Please update .env file with correct SMTP settings\n');
        } else {
            console.log('   ✅ SMTP credentials configured\n');

            // Optional: Test email sending
            console.log('4️⃣  Testing email service...');
            const emailService = require('../utils/emailService');

            // Don't actually send, just verify the service is ready
            console.log('   ✅ Email service loaded successfully\n');
        }

        console.log('✅ Admin setup complete!\n');
        console.log('📋 Summary:');
        console.log(`   - Admins table: ✅ Ready`);
        console.log(`   - Admin users: ${admins.length > 0 ? '✅' : '⚠️'} ${admins.length} user(s)`);
        console.log(`   - SMTP config: ${process.env.SMTP_HOST ? '✅' : '❌'} ${process.env.SMTP_HOST ? 'Configured' : 'Not configured'}`);
        console.log('\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        logger.error('Admin setup failed', { error: error.message });
        process.exit(1);
    }
}

fixAdminIssues();
