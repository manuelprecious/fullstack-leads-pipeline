const express = require('express');
const db = require('./db');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Backend server is running smoothly.' });
});

// GET: Fetch all behavioral leads from the database
app.get('/api/leads', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching leads:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST: Insert a new lead into the machine learning data pipeline
app.post('/api/leads', async (req, res) => {
    const {
        lead_number,
        lead_origin,
        lead_source,
        total_visits,
        time_spent_on_website,
        page_views_per_visit,
        last_activity,
        conversion_score
    } = req.body;

    // Crucial validation: lead_number is a NOT NULL constraint in your database
    if (lead_number === undefined || lead_number === null) {
        return res.status(400).json({ error: 'lead_number is required and cannot be null.' });
    }

    try {
        const queryText = `
      INSERT INTO leads (
        lead_number, 
        lead_origin, 
        lead_source, 
        total_visits, 
        time_spent_on_website, 
        page_views_per_visit, 
        last_activity, 
        conversion_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

        const values = [
            lead_number,
            lead_origin || null,
            lead_source || null,
            total_visits || 0,
            time_spent_on_website || 0,
            page_views_per_visit || 0.0,
            last_activity || 'New',
            conversion_score || 0
        ];

        const result = await db.query(queryText, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating lead:', err.message);

        // Handle unique constraint violations (e.g., duplicate lead_number) smoothly
        if (err.code === '23505') {
            return res.status(409).json({ error: 'A lead with this lead_number already exists.' });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server executing successfully on port ${PORT}`);
});