const db = require('../config/db');

async function createAdminTables() {
    try {
        console.log('Starting Admin Tables Creation...');

        // Support Tickets Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'general',
                status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
                priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                admin_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Support tickets table checked/created');

        // CMS Pages Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS cms_pages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                content LONGTEXT,
                meta_title VARCHAR(255),
                meta_description TEXT,
                meta_keywords TEXT,
                status ENUM('draft', 'published') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ CMS pages table checked/created');

        // SEO Settings Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS seo_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                site_title VARCHAR(255),
                site_description TEXT,
                site_keywords TEXT,
                og_image VARCHAR(500),
                twitter_handle VARCHAR(100),
                google_analytics_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ SEO settings table checked/created');

        // Insert default CMS pages
        await db.query(`
            INSERT IGNORE INTO cms_pages (slug, title, content, meta_title, meta_description, status) VALUES
            ('about-us', 'About Us', '<h1>About Hishab Kitab</h1><p>Your trusted business accounting partner.</p>', 'About Us - Hishab Kitab', 'Learn about Hishab Kitab - Free business accounting software', 'published'),
            ('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>', 'Privacy Policy - Hishab Kitab', 'Read our privacy policy and data protection practices', 'published'),
            ('terms-conditions', 'Terms & Conditions', '<h1>Terms & Conditions</h1><p>Please read these terms carefully.</p>', 'Terms & Conditions - Hishab Kitab', 'Terms and conditions for using Hishab Kitab', 'published')
        `);
        console.log('✅ Default CMS pages inserted');

        // 4. Create Admins Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                otp VARCHAR(10),
                otp_expires_at DATETIME,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Admins table checked/created');

        // Ensure 'role' column exists (fix for existing table)
        try {
            const [roleCol] = await db.query("SHOW COLUMNS FROM admins LIKE 'role'");
            if (roleCol.length === 0) {
                await db.query("ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'admin'");
                console.log('✅ Added missing role column to admins table');
            }
        } catch (colErr) {
            console.warn('Warning checking role column:', colErr.message);
        }

        // Seed Admin
        const adminEmail = 'nahadebmondal004@gmail.com';
        const [adminExists] = await db.query('SELECT * FROM admins WHERE email = ?', [adminEmail]);
        if (adminExists.length === 0) {
            // Check if username 'Admin' exists to avoid collision
            const [userExists] = await db.query('SELECT * FROM admins WHERE username = ?', ['Admin']);
            const newUsername = userExists.length > 0 ? 'Admin_Mahadeb' : 'Admin';

            await db.query('INSERT INTO admins (username, email, role) VALUES (?, ?, ?)',
                [newUsername, adminEmail, 'admin']);
            console.log('✅ Default admin seeded:', adminEmail, 'as', newUsername);
        } else {
            console.log('ℹ️ Admin already exists:', adminEmail);
        }

        console.log('Admin tables created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin tables:', error);
        process.exit(1);
    }
}

createAdminTables();
