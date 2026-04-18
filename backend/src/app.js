const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes (Stubs to be further implemented)
// const authRoutes = require('./routes/authRoutes');
// const jobRoutes = require('./routes/jobRoutes');

// app.use('/api/auth', authRoutes);
// app.use('/api/jobs', jobRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend foundation' }));

module.exports = { app };
