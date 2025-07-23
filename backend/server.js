const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const examRoutes = require('./routes/examRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug endpoint
app.get('/test', (req, res) => res.send('Backend is alive'));

app.use('/api', examRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));