const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const examRoutes = require('./routes/examRoutes');
const OpenAI = require('openai');

// Load existing models
const Exam = require('./models/Exam');
const Question = require('./models/Question');

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

// New endpoint for creating an exam with questions
app.post('/api/create-exam', async (req, res) => {
  const { title, difficulty } = req.body;

  if (!title || !difficulty) {
    return res.status(400).json({ error: 'Title and difficulty are required' });
  }

  const prompt = `Generate a ${difficulty} level exam with 5 multiple-choice questions based on the title "${title}". Return ONLY a valid JSON array where each object has the fields: "question_text" (string), "options" (array of 4 strings), and "correct_option" (string representing one of the options). Do not include any additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });
    const rawResponse = response.choices[0].message.content;
    console.log('Raw OpenAI Response:', rawResponse);

    let examData;
    try {
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch && jsonMatch[0]) {
        examData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON array found in response');
      }
    } catch (parseError) {
      console.error('JSON Parsing Error:', parseError.message);
      return res.status(500).json({ error: 'Invalid JSON response from AI. Please try again.' });
    }

    if (!Array.isArray(examData) || examData.length !== 5) {
      throw new Error('Invalid exam data structure: Expected 5 questions');
    }

    // Create new exam
    const newExam = new Exam({
      title,
      description: `A ${difficulty} level exam on ${title}`, // Optional description
    });
    const savedExam = await newExam.save();

    // Create and save questions linked to the exam
    const questions = examData.map(q => new Question({
      exam_id: savedExam._id,
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
    }));
    await Question.insertMany(questions);

    res.json(savedExam); // Return the saved exam for frontend refresh
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

app.use('/api', examRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));