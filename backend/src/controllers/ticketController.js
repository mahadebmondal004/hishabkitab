const db = require('../config/db');

exports.createTicket = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { subject, category, description } = req.body;

    if (!userId) return res.status(401).json({ error: 'User ID required' });

    try {
        const [result] = await db.execute(
            'INSERT INTO support_tickets (user_id, subject, category, description) VALUES (?, ?, ?, ?)',
            [userId, subject, category, description]
        );
        res.status(201).json({ message: 'Ticket created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTickets = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'User ID required' });

    try {
        const [tickets] = await db.execute(
            'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
