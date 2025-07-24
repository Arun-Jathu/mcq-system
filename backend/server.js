const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const examRoutes = require('./routes/examRoutes');
const OpenAI = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug endpoint
app.get('/test', (req, res) => res.send('Backend is alive'));

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// New endpoint for generating exams
app.post('/api/generate-exam', async (req, res) => {
  const { title, difficulty } = req.body;

  if (!title || !difficulty) {
    return res.status(400).json({ error: 'Title and difficulty are required' });
  }

  const prompt = `Generate a ${difficulty} level exam with 5 multiple-choice questions based on the title "${title}". Provide the output in JSON format with fields: question, options (array of 4 strings), and correct_answer (index 0-3).`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });

    const examData = JSON.parse(response.choices[0].message.content);
    res.json(examData);
  } catch (error) {
    console.error('Error generating exam:', error);
    res.status(500).json({ error: 'Failed to generate exam' });
  }
});

app.use('/api', examRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));