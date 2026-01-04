const db = require('../config/db');

async function createTicketsTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                subject VARCHAR(255) NOT NULL,
                category VARCHAR(50),
                description TEXT,
                status VARCHAR(20) DEFAULT 'OPEN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await db.execute(query);
        console.log('support_tickets table created or already exists.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating support_tickets table:', error);
        process.exit(1);
    }
}

createTicketsTable();
