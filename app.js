require('dotenv').config();

const express = require('express');
const cors = require('cors');

const readingRoutes = require('./routes/readings');
const thresholdRoutes = require('./routes/thresholds');
const alertRoutes = require('./routes/alerts');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/readings', readingRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});