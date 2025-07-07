require('dotenv').config();
const express = require('express');
const cors = require('cors');
const LiturgicalEngine = require('./liturgical-engine');

const app = express();
const PORT = process.env.PORT || 9837;
const HOST = process.env.HOST || 'localhost';

app.use(cors());
app.use(express.json());

const liturgicalEngine = new LiturgicalEngine();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get liturgical calendar for a date
app.get('/calendar/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const calendar = await liturgicalEngine.getCalendar(date);
    res.json(calendar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Mass texts for a date
app.get('/mass/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const mass = await liturgicalEngine.getMass(date);
    res.json(mass);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Breviary texts for a date and hour
app.get('/breviary/:date/:hour', async (req, res) => {
  try {
    const { date, hour } = req.params;
    const breviary = await liturgicalEngine.getBreviary(date, hour);
    res.json(breviary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all breviary hours for a date
app.get('/breviary/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const breviary = await liturgicalEngine.getAllBreviaryHours(date);
    res.json(breviary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get liturgical year info
app.get('/liturgical-year/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const yearInfo = await liturgicalEngine.getLiturgicalYear(date);
    res.json(yearInfo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Liturgical API server running on http://${HOST}:${PORT}`);
});