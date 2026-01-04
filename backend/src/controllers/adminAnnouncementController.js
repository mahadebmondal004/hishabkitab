const db = require('../config/db');

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
    try {
        const [announcements] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, type } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message are required' });
        }

        await db.query(
            'INSERT INTO announcements (title, message, type, is_active, created_at) VALUES (?, ?, ?, TRUE, NOW())',
            [title, message, type || 'info']
        );

        res.status(201).json({ message: 'Announcement created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle active status
exports.toggleStatus = async (req, res) => {
    try {
        await db.query(
            'UPDATE announcements SET is_active = NOT is_active WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
