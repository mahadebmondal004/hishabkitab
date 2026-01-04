const db = require('../config/db');

exports.getAllCustomers = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];

        // If no user ID is provided, return empty list or error (for now returning empty to be safe)
        if (!userId) {
            // Fallback for backward compatibility or debugging if needed, but for "isolation" we should strictly require it.
            // However, to avoid breaking if the header is missing during dev, we might verify.
            // Given the user request: "user wise alag alag", let's strictly filter if ID exists, else maybe return all? 
            // No, returning all is the bug. 
            return res.json([]);
        }

        const query = `
      SELECT c.*, 
      (SELECT IFNULL(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE -amount END), 0) 
       FROM ledger_entries WHERE customer_id = c.id) as balance,
      (SELECT MAX(entry_date) FROM ledger_entries WHERE customer_id = c.id) as last_entry_date
      FROM customers c
      WHERE c.user_id = ?
      ORDER BY last_entry_date DESC
    `;
        const [customers] = await db.execute(query, [userId]);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    // Priority: Header > Body > Default(1)
    // Priority: Header > Body
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO customers (name, mobile, note, user_id) VALUES (?, ?, ?, ?)',
            [name, mobile, note, userId]
        );
        res.status(201).json({ id: result.insertId, name, mobile, note });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });

        const query = 'SELECT * FROM customers WHERE id = ? AND user_id = ?';
        const params = [req.params.id, userId];

        const [customers] = await db.execute(query, params);
        if (customers.length === 0) return res.status(404).json({ message: 'Customer not found' });

        const [balanceResult] = await db.execute(
            `SELECT IFNULL(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE -amount END), 0) as balance 
             FROM ledger_entries WHERE customer_id = ?`,
            [req.params.id]
        );

        const customer = customers[0];
        customer.balance = balanceResult[0].balance;

        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
};

exports.deleteCustomer = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });

        const [result] = await db.execute('DELETE FROM customers WHERE id = ? AND user_id = ?', [req.params.id, userId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found or unauthorized' });

        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
