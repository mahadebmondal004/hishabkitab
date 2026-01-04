const db = require('../config/db');
const emailService = require('../utils/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const logger = require('../utils/logger');

    try {
        logger.info('Admin OTP request received', { email });
        console.log('📧 Sending OTP to:', email);

        const [admins] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);

        if (admins.length === 0) {
            logger.warn('Admin email not found', { email });
            console.log('❌ Admin not found:', email);
            return res.status(404).json({ success: false, message: 'Admin email not found' });
        }

        const admin = admins[0];
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now

        console.log('✅ Admin found:', admin.username);
        console.log('🔑 Generated OTP:', otp);

        // Save OTP to DB
        await db.execute('UPDATE admins SET otp = ?, otp_expires_at = ? WHERE id = ?', [otp, expiresAt, admin.id]);
        console.log('💾 OTP saved to database');

        // Send Email in Background (Don't await)
        console.log('📨 Triggering background email...');
        emailService.sendOtpEmail(email, otp).then(sent => {
            if (sent) {
                logger.info('OTP email sent successfully (Background)', { email });
                console.log('✅ Email sent successfully (Background)');
            } else {
                logger.error('Failed to send OTP email (Background)', { email });
                console.log('❌ Email sending failed (Background)');
            }
        }).catch(err => {
            logger.error('Background email error', { error: err.message });
            console.error('❌ Background email error:', err.message);
        });

        // Instant Response
        logger.info('OTP request processed successfully', { email });
        res.json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        logger.error('Admin OTP error', { email, error: error.message });
        console.error('❌ Error in sendOtp:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const [admins] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
        if (admins.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const admin = admins[0];

        // Check OTP
        if (!admin.otp || admin.otp !== otp) {
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }

        // Check Expiry
        const now = new Date();
        const expiresAt = new Date(admin.otp_expires_at);
        if (now > expiresAt) {
            return res.status(401).json({ success: false, message: 'OTP expired' });
        }

        // Clear OTP after successful login
        await db.execute('UPDATE admins SET otp = NULL, otp_expires_at = NULL WHERE id = ?', [admin.id]);

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            token: token,
            admin: { id: admin.id, username: admin.username, email: admin.email }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const query = `
            SELECT c.*, u.name as user_name, u.mobile as user_mobile,
            (SELECT IFNULL(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE -amount END), 0) 
             FROM ledger_entries WHERE customer_id = c.id) as balance
            FROM customers c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        `;
        const [customers] = await db.execute(query);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
