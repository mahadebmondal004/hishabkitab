const db = require('../config/db');

// Get all CMS pages
exports.getAllPages = async (req, res) => {
    try {
        const [pages] = await db.query('SELECT * FROM cms_pages ORDER BY updated_at DESC');
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get page by slug
exports.getPageBySlug = async (req, res) => {
    try {
        const [page] = await db.query('SELECT * FROM cms_pages WHERE slug = ?', [req.params.slug]);

        if (page.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json(page[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new page
exports.createPage = async (req, res) => {
    try {
        const { title, slug, content, meta_title, meta_description, meta_keywords, status } = req.body;

        const [result] = await db.query(`
            INSERT INTO cms_pages (title, slug, content, meta_title, meta_description, meta_keywords, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, slug, content, meta_title, meta_description, meta_keywords, status || 'draft']);

        res.json({ id: result.insertId, message: 'Page created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update page
exports.updatePage = async (req, res) => {
    try {
        const { title, slug, content, meta_title, meta_description, meta_keywords, status } = req.body;

        await db.query(`
            UPDATE cms_pages 
            SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, status = ?, updated_at = NOW()
            WHERE id = ?
        `, [title, slug, content, meta_title, meta_description, meta_keywords, status, req.params.id]);

        res.json({ message: 'Page updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete page
exports.deletePage = async (req, res) => {
    try {
        await db.query('DELETE FROM cms_pages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Page deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get SEO settings
exports.getSEOSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM seo_settings LIMIT 1');
        res.json(settings[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update SEO settings
exports.updateSEOSettings = async (req, res) => {
    try {
        const { site_title, site_description, site_keywords, og_image, twitter_handle, google_analytics_id } = req.body;

        const [existing] = await db.query('SELECT id FROM seo_settings LIMIT 1');

        if (existing.length > 0) {
            await db.query(`
                UPDATE seo_settings 
                SET site_title = ?, site_description = ?, site_keywords = ?, og_image = ?, twitter_handle = ?, google_analytics_id = ?, updated_at = NOW()
                WHERE id = ?
            `, [site_title, site_description, site_keywords, og_image, twitter_handle, google_analytics_id, existing[0].id]);
        } else {
            await db.query(`
                INSERT INTO seo_settings (site_title, site_description, site_keywords, og_image, twitter_handle, google_analytics_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [site_title, site_description, site_keywords, og_image, twitter_handle, google_analytics_id]);
        }

        res.json({ message: 'SEO settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
