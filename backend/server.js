// Server Entry Point
// Loads environment variables and starts the Express application.
require('dotenv').config();
const { app } = require('./src/app');

// Determine port and start listening for incoming HTTP requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
