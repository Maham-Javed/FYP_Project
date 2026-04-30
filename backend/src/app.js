// Express App Configuration
// Sets up middleware, routing, and core server configuration.
const express = require('express');
const cors = require('cors');

const app = express();

// Apply middleware for Cross-Origin requests and parsing JSON request bodies
app.use(cors());
app.use(express.json());

// Simple health check endpoint to verify backend connectivity
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend foundation' }));

module.exports = { app };
