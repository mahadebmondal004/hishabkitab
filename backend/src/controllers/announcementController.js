const db = require('../config/db');

// Get active announcements for users
exports.getActiveAnnouncements = async (req, res) => {
    try {
        const [announcements] = await db.query(
            'SELECT * FROM announcements WHERE is_active = TRUE ORDER BY created_at DESC'
        );
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
