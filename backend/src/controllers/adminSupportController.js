const db = require('../config/db');

// Get all support tickets
exports.getAllTickets = async (req, res) => {
    try {
        const [tickets] = await db.query(`
            SELECT t.*, u.name as user_name, u.mobile as user_mobile, 
            COALESCE(t.id, 0) as id_check
            FROM support_tickets t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        `);
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
    try {
        const [ticket] = await db.query(`
            SELECT t.*, u.name as user_name, u.mobile as user_mobile 
            FROM support_tickets t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        `, [req.params.id]);

        if (ticket.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.json(ticket[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { status, admin_response } = req.body;

        await db.query(`
            UPDATE support_tickets 
            SET status = ?, admin_response = ?, updated_at = NOW()
            WHERE id = ?
        `, [status, admin_response, req.params.id]);

        res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
    try {
        await db.query('DELETE FROM support_tickets WHERE id = ?', [req.params.id]);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get ticket statistics
exports.getTicketStats = async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN LOWER(status) = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN LOWER(status) = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN LOWER(status) = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN LOWER(status) = 'closed' THEN 1 ELSE 0 END) as closed
            FROM support_tickets
        `);

        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
