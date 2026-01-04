const pool = require('../config/db');

exports.getCollections = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const [rows] = await pool.query('SELECT * FROM collections WHERE user_id = ? ORDER BY date DESC, created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCollection = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { amount, customer_name, payment_mode, date, note } = req.body;
        const [result] = await pool.query(
            'INSERT INTO collections (user_id, amount, customer_name, payment_mode, date, note) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, amount, customer_name, payment_mode, date, note]
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCollection = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        await pool.query('DELETE FROM collections WHERE id=? AND user_id=?', [id, userId]);
        res.json({ message: 'Collection deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
