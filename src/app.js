require('dotenv').config();

//Dependences imports
const express = require('express');
const cors = require('cors');
//Local imports
const apiRouter = require('./routes/router');

/**
 * @description Configure Express middleware and settings
 */
const app = express();

const corsOrigin =
  process.env.CORS_ORIGIN ||
  'http://localhost:5173';
const corsOrigins = corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin:
      corsOrigins.length <= 1
        ? corsOrigins[0] || true
        : corsOrigins,
  })
);

const port = process.env.PORT || 5501;
app.use(express.json()); // Parse JSON body content

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRouter); // Mount the API routes with express-validator





/**
 * @description Start the Express server
 */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});




module.exports = app;