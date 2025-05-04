// backend/index.js
require('dotenv').config();
const express = require('express');
const app = express();
const paymentsRouter = require('./routes/payments');

// middleware
app.use(express.json());

// mount the payments router
app.use('/api', paymentsRouter);

// your other routes...
// e.g. app.use('/api/ads', adsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
