const db = require('../config/db');
const bcrypt = require('bcrypt');
const emailService = require('../utils/emailService');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    const { name, mobile, pin } = req.body;
    try {
        // Validate Indian Mobile Number (10 digits, starts with 6-9)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ message: 'Invalid mobile number. Must be a valid 10-digit Indian number.' });
        }

        // Check for duplicate mobile
        const [existing] = await db.execute('SELECT id FROM users WHERE mobile = ?', [mobile]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Mobile number already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(pin, salt);

        const [result] = await db.execute(
            'INSERT INTO users (name, mobile, pin_hash) VALUES (?, ?, ?)',
            [name, mobile, pinHash]
        );

        res.status(201).json({ message: 'User registered', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { mobile, pin } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE mobile = ?', [mobile]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isMatch = await bcrypt.compare(pin, user.pin_hash);

        if (!isMatch) return res.status(401).json({ message: 'Invalid PIN' });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                is_email_verified: user.is_email_verified,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.changePin = async (req, res) => {
    const { userId, oldPin, newPin } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isMatch = await bcrypt.compare(oldPin, user.pin_hash);

        if (!isMatch) return res.status(401).json({ message: 'Incorrect old PIN' });

        const salt = await bcrypt.genSalt(10);
        const newPinHash = await bcrypt.hash(newPin, salt);

        await db.execute('UPDATE users SET pin_hash = ? WHERE id = ?', [newPinHash, userId]);

        res.json({ message: 'PIN updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.setPin = async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
};

exports.verifyPin = async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const [users] = await db.execute('SELECT id, name, mobile, email, is_email_verified, business_name, profile_picture, business_address, business_category, business_type, gstin, bank_account_number, ifsc_code FROM users WHERE id = ?', [userId]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, business_name, address, business_category, business_type, gstin, bank_account_number, ifsc_code } = req.body;
        let profile_picture = req.body.profile_picture;

        console.log(`[UpdateProfile] Request for User ${userId}`);
        if (req.file) {
            console.log(`[UpdateProfile] File received: ${req.file.originalname} (${req.file.size} bytes)`);
            profile_picture = `/uploads/${req.file.filename}`;
        } else {
            console.log('[UpdateProfile] No file received');
        }

        // Build dynamic query
        let query = 'UPDATE users SET ';
        const params = [];
        const updates = [];

        if (name) { updates.push('name = ?'); params.push(name); }

        if (email) {
            // Check if email changed logic requires fetching user first, simplified here by assuming update
            // But to set verified status to false, we must know if it changed. 
            // Actually, simplest is: if email is sent, assume it might change.
            // But we shouldn't reset verified if the email is same.
            const [rows] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
            const currentEmail = rows[0]?.email;

            if (currentEmail !== email) {
                updates.push('is_email_verified = 0');
            }
            updates.push('email = ?');
            params.push(email);
        }

        if (address) { updates.push('business_address = ?'); params.push(address); }
        if (business_category) { updates.push('business_category = ?'); params.push(business_category); }
        if (business_type) { updates.push('business_type = ?'); params.push(business_type); }
        if (gstin) { updates.push('gstin = ?'); params.push(gstin); }
        if (bank_account_number) { updates.push('bank_account_number = ?'); params.push(bank_account_number); }
        if (ifsc_code) { updates.push('ifsc_code = ?'); params.push(ifsc_code); }

        if (business_name) { updates.push('business_name = ?'); params.push(business_name); }
        if (profile_picture) { updates.push('profile_picture = ?'); params.push(profile_picture); }

        if (updates.length === 0) return res.json({ message: 'No changes' });

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(userId);

        await db.execute(query, params);

        const [users] = await db.execute('SELECT id, name, mobile, email, is_email_verified, business_name, profile_picture, business_address, business_category, business_type, gstin, bank_account_number, ifsc_code FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Profile updated', user: users[0] });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// --- Email Verification ---

exports.sendEmailVerificationOtp = async (req, res) => {
    const userId = req.params.id;
    try {
        const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const email = users[0].email;
        if (!email) return res.status(400).json({ message: 'Please update your profile with an email address first.' });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

        await db.execute('UPDATE users SET email_otp = ?, email_otp_expires_at = ? WHERE id = ?', [otp, expiresAt, userId]);

        // Use the same email service (which uses environment SMTP settings)
        // Note: modify emailService slightly if needed to customize subject, or just use general one
        // Ideally we should refactor sendOtpEmail in emailService to be generic, OR create a new method sendVerificationOtp
        // For now, I will use sendOtpEmail but the subject says "Admin Login OTP". 
        // I should update emailService to allow subject/template customization or add a new method.
        // I'll update emailService in next step. Assuming sendEmail(to, subject, html) exists or sendOtpEmail.
        // Let's assume I'll add `sendGeneralEmail` or `sendUserVerificationEmail` to utils/emailService.js

        const emailSent = await emailService.sendOtpEmail(email, otp, "Verify Email Address", "Your Email Verification OTP is:");

        if (emailSent) {
            res.json({ success: true, message: 'OTP sent to your email.' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send OTP.' });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyEmailOtp = async (req, res) => {
    const userId = req.params.id;
    const { otp } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        if (!user.email_otp || user.email_otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.email_otp_expires_at)) {
            return res.status(400).json({ success: false, message: 'OTP Expired' });
        }

        await db.execute('UPDATE users SET is_email_verified = 1, email_otp = NULL, email_otp_expires_at = NULL WHERE id = ?', [userId]);

        const [updatedUser] = await db.execute('SELECT id, name, mobile, email, is_email_verified, business_name, profile_picture FROM users WHERE id = ?', [userId]);

        res.json({ success: true, message: 'Email verified successfully!', user: updatedUser[0] });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
