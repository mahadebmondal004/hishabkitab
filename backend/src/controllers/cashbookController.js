const db = require('../config/db');

exports.getEntries = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.json({ entries: [], categories: [], summary: {} });

        // Fetch all entries for user
        // Fetch all categories first
        const [allCategories] = await db.execute('SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC', [userId]);

        // Fetch all entries for user
        const query = `
            SELECT * FROM cashbook_entries 
            WHERE user_id = ? 
            ORDER BY entry_date DESC
        `;
        const [entries] = await db.execute(query, [userId]);

        // Calculate Global Summary
        let totalBalance = 0;
        let todaysBalance = 0;
        let onlineBalance = 0;
        let cashBalance = 0;
        let todaysOnlineBalance = 0;
        let todaysCashBalance = 0;

        const today = new Date().toISOString().split('T')[0];

        // Process for Summary
        entries.forEach(entry => {
            const amount = parseFloat(entry.amount);
            const isToday = new Date(entry.entry_date).toISOString().split('T')[0] === today;
            const isIncome = entry.entry_type === 'IN';

            // Net Amount for balance calc
            const netAmount = isIncome ? amount : -amount;

            totalBalance += netAmount;

            if (entry.payment_mode === 'ONLINE') {
                onlineBalance += netAmount;
            } else {
                cashBalance += netAmount;
            }

            if (isToday) {
                todaysBalance += netAmount;
                if (entry.payment_mode === 'ONLINE') {
                    todaysOnlineBalance += netAmount;
                } else {
                    todaysCashBalance += netAmount;
                }
            }
        });

        // Initialize map with all created categories (even empty ones)
        const categoriesMap = {};
        allCategories.forEach(cat => {
            categoriesMap[cat.name] = {
                name: cat.name,
                id: cat.id,
                total_in: 0,
                total_out: 0,
                balance: 0,
                last_entry_date: cat.created_at, // Default to creation date
                entries_count: 0
            };
        });

        // Populate map with entry data
        entries.forEach(entry => {
            const cat = entry.category || 'Uncategorized';

            // If category wasn't in DB list (legacy data), init it
            if (!categoriesMap[cat]) {
                categoriesMap[cat] = {
                    name: cat,
                    total_in: 0,
                    total_out: 0,
                    balance: 0,
                    last_entry_date: entry.entry_date,
                    entries_count: 0
                };
            } else {
                // Update last entry date if this entry is newer
                if (new Date(entry.entry_date) > new Date(categoriesMap[cat].last_entry_date)) {
                    categoriesMap[cat].last_entry_date = entry.entry_date;
                }
            }

            const amount = parseFloat(entry.amount);
            if (entry.entry_type === 'IN') {
                categoriesMap[cat].total_in += amount;
                categoriesMap[cat].balance += amount;
            } else {
                categoriesMap[cat].total_out += amount;
                categoriesMap[cat].balance -= amount;
            }
            categoriesMap[cat].entries_count++;
        });

        const categories = Object.values(categoriesMap).sort((a, b) => new Date(b.last_entry_date) - new Date(a.last_entry_date));

        res.json({
            entries, // Raw list if needed
            categories, // Grouped list for Home-like view
            summary: {
                totalBalance,
                todaysBalance,
                onlineBalance,
                cashBalance,
                todaysOnlineBalance,
                todaysCashBalance
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addEntry = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { amount, entry_type, category, entry_date, payment_mode } = req.body;
    let attachment_url = null;

    if (req.file) {
        attachment_url = `/uploads/${req.file.filename}`;
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO cashbook_entries (user_id, amount, entry_type, category, attachment_url, entry_date, payment_mode) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, amount, entry_type, category, attachment_url, entry_date || new Date(), payment_mode || 'CASH']
        );
        res.status(201).json({ message: 'Entry added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    const userId = req.headers['x-user-id'];
    try {
        const [categories] = await db.execute('SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC', [userId]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { name, type } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
            [userId, name, type || 'BOTH']
        );
        res.status(201).json({ id: result.insertId, name, type });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

