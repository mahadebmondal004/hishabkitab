const db = require('../config/db');

exports.addEntry = async (req, res) => {
    const customerId = req.params.id;
    const userId = req.headers['x-user-id'];
    const { entry_type, amount, note, date } = req.body;

    if (!userId) return res.status(401).json({ error: 'User ID required' });

    if (!['CREDIT', 'DEBIT'].includes(entry_type)) {
        return res.status(400).json({ message: 'Invalid entry type' });
    }

    try {
        // Verify customer ownership
        const [customer] = await db.execute('SELECT id FROM customers WHERE id = ? AND user_id = ?', [customerId, userId]);
        if (customer.length === 0) return res.status(403).json({ message: 'Unauthorized or Customer not found' });

        const defaultDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const entryDate = date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : defaultDate;

        const [result] = await db.execute(
            'INSERT INTO ledger_entries (customer_id, entry_type, amount, note, entry_date) VALUES (?, ?, ?, ?, ?)',
            [customerId, entry_type, amount, note, entryDate]
        );

        res.status(201).json({ id: result.insertId, customerId, entry_type, amount, note, entry_date: entryDate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEntriesByCustomer = async (req, res) => {
    const customerId = req.params.id;
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'User ID required' });

    try {
        // Verify customer ownership
        const [customer] = await db.execute('SELECT id FROM customers WHERE id = ? AND user_id = ?', [customerId, userId]);
        if (customer.length === 0) return res.status(403).json({ message: 'Unauthorized or Customer not found' });

        const [entries] = await db.execute(
            'SELECT * FROM ledger_entries WHERE customer_id = ? ORDER BY entry_date ASC',
            [customerId]
        );
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        await db.execute('DELETE FROM ledger_entries WHERE id = ?', [req.params.id]);
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEntry = async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
};
