const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all Invoices
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });
        const query = `
            SELECT i.*, c.name as customer_name_linked 
            FROM invoices i 
            LEFT JOIN customers c ON i.customer_id = c.id 
            WHERE i.user_id = ? 
            ORDER BY i.created_at DESC
        `;
        const [results] = await db.query(query, [userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Invoice by ID (with Items)
router.get('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });
        const invoiceId = req.params.id;

        // 1. Get Invoice Details
        const [invoice] = await db.query(`
            SELECT i.*, c.name as customer_name_linked, c.mobile as customer_mobile
            FROM invoices i 
            LEFT JOIN customers c ON i.customer_id = c.id 
            WHERE i.id = ? AND i.user_id = ?
        `, [invoiceId, userId]);

        if (invoice.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // 2. Get Invoice Items
        const [items] = await db.query(`
             SELECT * FROM invoice_items WHERE invoice_id = ?
        `, [invoiceId]);

        res.json({ ...invoice[0], items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Create Invoice
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });
        const { customer_id, customer_name, total_amount, type, items } = req.body;

        // Handle Walking Customer (null ID)
        const validCustomerId = customer_id ? customer_id : null;
        const validCustomerName = customer_name || 'Walking Customer';

        // 1. Insert Invoice
        const invoiceQuery = 'INSERT INTO invoices (user_id, customer_id, customer_name, total_amount, type) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(invoiceQuery, [userId, validCustomerId, validCustomerName, total_amount, type || 'SALE']);

        const invoiceId = result.insertId;

        // 2. Insert Invoice Items
        if (items && items.length > 0) {
            const itemValues = items.map(item => [
                invoiceId,
                item.product_id,
                item.product_name,
                item.quantity,
                item.rate,
                item.amount
            ]);

            const itemQuery = 'INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, rate, amount) VALUES ?';
            await db.query(itemQuery, [itemValues]);
        }

        res.status(201).json({ message: 'Invoice created', id: invoiceId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
