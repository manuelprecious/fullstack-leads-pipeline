const express = require('express');
const http = require('http');
const cors = require('cors'); // Added: Required for cross-origin container requests
const db = require('./db');
const logger = require('./logger'); // Import our structured logger instance
require('dotenv').config({ path: '../.env' });

// ==========================================
// ENVIRONMENT VERIFICATION & CONFIGURATION
// ==========================================
const FRONTEND_URL = process.env.FRONTEND_URL;

// STRICT ASSERTION: REMOVED FOR SAME-ORIGIN NGINX PROXY PATTERN
// if (!FRONTEND_URL) {
//     const errorMsg = "CRITICAL CONFIGURATION ERROR: 'FRONTEND_URL' environment variable is missing.";
//     logger.error(errorMsg);
//     throw new Error(errorMsg);
// }

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Open standard CORS since Nginx handles structural routing restrictions
app.use(cors());

// Request logging middleware to track incoming traffic metrics
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url, ip: req.ip }, 'Incoming network request');
    next();
});

// Health check endpoint - updated with /api prefix
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Backend server is running smoothly.' });
});

// GET: Fetch all behavioral leads from the database
app.get('/api/leads', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        logger.error({ error: err.message, stack: err.stack }, 'Error fetching leads from database');
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
        logger.warn({ body: req.body }, 'Lead insertion rejected: missing lead_number');
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
        logger.info({ lead_id: result.rows[0].id, lead_number }, 'New lead recorded successfully');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        // Handle unique constraint violations (e.g., duplicate lead_number) smoothly
        if (err.code === '23505') {
            logger.warn({ lead_number }, 'Lead insertion rejected: duplicate lead_number');
            return res.status(409).json({ error: 'A lead with this lead_number already exists.' });
        }

        logger.error({ error: err.message, stack: err.stack }, 'Error creating lead in database');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create the explicit HTTP server instance
const server = http.createServer(app);

// Start the server process
server.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server executing successfully');
});

// ==========================================
// GRACEFUL SHUTDOWN SEQUENCE
// ==========================================

function handleShutdown(signal) {
    logger.info({ signal }, 'Received termination signal. Starting graceful shutdown sequence');

    // 1. Stop accepting new connections over the network
    server.close(() => {
        logger.info('HTTP server stopped. No longer accepting new connections');

        // 2. Securely close the database connection pool
        if (db && typeof db.end === 'function') {
            db.end()
                .then(() => {
                    logger.info('Database connection pool drained and closed cleanly');
                    logger.info('Backend cleanup complete. Exiting process safely');
                    process.exit(0);
                })
                .catch((err) => {
                    logger.error({ error: err.message }, 'Error closing database pool during shutdown');
                    process.exit(1);
                });
        } else {
            logger.info('No active database pool cleanup required. Exiting');
            process.exit(0);
        }
    });

    // Safety valve: Force immediate exit if handlers hang beyond Docker's grace window
    setTimeout(() => {
        logger.fatal('Shutdown timed out! Forcing abrupt termination');
        process.exit(1);
    }, 10000);
}

// Listen for termination events sent by Docker and the OS
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));