// Server Entry Point
// Loads environment variables and starts the Express application.
const { validateEnv } = require('./src/config/env');
validateEnv();

const { app } = require('./src/app');
const EmbeddingService = require('./src/services/embedding.service');

// Determine port and start listening for incoming HTTP requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Pre-warm the AI model in the background so it's instantly ready for the first user
  await EmbeddingService.initialize();
});
