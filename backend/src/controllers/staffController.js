const pool = require('../config/db');

exports.getStaff = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const [rows] = await pool.query('SELECT * FROM staff WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addStaff = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { name, role, mobile, salary } = req.body;
        const [result] = await pool.query(
            'INSERT INTO staff (user_id, name, role, mobile, salary) VALUES (?, ?, ?, ?, ?)',
            [userId, name, role, mobile, salary]
        );
        res.json({ id: result.insertId, name, role, mobile, salary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const { name, role, mobile, salary, status } = req.body;
        await pool.query(
            'UPDATE staff SET name=?, role=?, mobile=?, salary=?, status=? WHERE id=? AND user_id=?',
            [name, role, mobile, salary, status, id, userId]
        );
        res.json({ message: 'Staff updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        await pool.query('DELETE FROM staff WHERE id=? AND user_id=?', [id, userId]);
        res.json({ message: 'Staff deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
