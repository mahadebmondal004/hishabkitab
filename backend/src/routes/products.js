const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all products
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });

        const { type } = req.query; // Support filtering by type
        let query = 'SELECT * FROM products WHERE user_id = ?';
        const params = [userId];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        query += ' ORDER BY name ASC';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });

        const [results] = await db.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, userId]);
        if (results.length === 0) return res.status(404).json({ error: 'Item not found' });

        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create new product/service
router.post('/', async (req, res) => {
    try {
        const {
            name, rate, unit, stock, type,
            purchase_rate, low_stock_alert, tax_included,
            tax_rate, hsn_sac
        } = req.body;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });

        const query = `
            INSERT INTO products (
                user_id, name, rate, unit, stock, type,
                purchase_rate, low_stock_alert, tax_included,
                tax_rate, hsn_sac
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            userId, name, rate, unit || 'pc', stock || 0, type || 'PRODUCT',
            purchase_rate || 0, low_stock_alert || 0, tax_included || false,
            tax_rate || 0, hsn_sac || null
        ]);

        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE product
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });
        const {
            name, rate, unit, stock, type,
            purchase_rate, low_stock_alert, tax_included,
            tax_rate, hsn_sac
        } = req.body;

        const query = `
            UPDATE products SET 
                name = ?, rate = ?, unit = ?, stock = ?, 
                purchase_rate = ?, low_stock_alert = ?, 
                tax_included = ?, tax_rate = ?, hsn_sac = ?
            WHERE id = ? AND user_id = ?
        `;

        await db.query(query, [
            name, rate, unit, stock,
            purchase_rate, low_stock_alert,
            tax_included, tax_rate, hsn_sac,
            req.params.id, userId
        ]);

        res.json({ message: 'Product updated', id: req.params.id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'User ID required' });
        await db.query('DELETE FROM products WHERE id = ? AND user_id = ?', [req.params.id, userId]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
