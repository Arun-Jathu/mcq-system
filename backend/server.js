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

// Middleware to handle uncaught errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'An unexpected server error occurred. Please try again later.' });
});

// Enhanced endpoint for creating an exam with questions
app.post('/api/create-exam', async (req, res) => {
  const { title, difficulty } = req.body;

  // Input validation
  if (!title || !difficulty) {
    return res.status(400).json({ error: 'Title and difficulty are required fields.' });
  }
  if (!['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
    return res.status(400).json({ error: 'Difficulty must be "easy", "medium", or "hard".' });
  }

  const prompt = `You are an exam generator. Generate a valid JSON array of exactly 5 multiple-choice questions for a ${difficulty} level exam based on the topic "${title}". Each object in the array must have the following fields: "question_text" (a string with the question), "options" (an array of exactly 4 unique strings representing the choices), and "correct_option" (a string that matches one of the options). Return ONLY the JSON array with no additional text, comments, or formatting. Example: [{"question_text":"2+2?","options":["1","2","3","4"],"correct_option":"4"}]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500, // Increased to accommodate more data
      temperature: 0.7, // Adjusted for more consistent output
    });

    const rawResponse = response.choices[0].message.content.trim();
    console.log('Raw OpenAI Response:', rawResponse);

    // Validate and parse JSON
    let examData;
    try {
      // Extract JSON array using regex, ensuring it starts with [ and ends with ]
      const jsonMatch = rawResponse.match(/^(\[[\s\S]*\])\s*$/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error('No valid JSON array detected in AI response');
      }
      examData = JSON.parse(jsonMatch[1]);

      // Validate structure
      if (!Array.isArray(examData) || examData.length !== 5) {
        throw new Error('Expected exactly 5 questions in the JSON array');
      }

      examData.forEach((q, index) => {
        if (!q.question_text || typeof q.question_text !== 'string') {
          throw new Error(`Question ${index + 1} is missing or has invalid question_text`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 unique options`);
        }
        if (!q.options.includes(q.correct_option)) {
          throw new Error(`Question ${index + 1} correct_option must be one of the options`);
        }
      });
    } catch (parseError) {
      console.error('JSON Parsing or Validation Error:', parseError.message);
      return res.status(500).json({ error: `Failed to process AI response: ${parseError.message}. Please adjust the input and try again.` });
    }

    // Database transaction-like approach (if supported by your MongoDB version)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newExam = new Exam({
        title,
        description: `A ${difficulty} level exam on ${title}`,
      });
      const savedExam = await newExam.save({ session });

      const questions = examData.map(q => new Question({
        exam_id: savedExam._id,
        question_text: q.question_text,
        options: q.options,
        correct_option: q.correct_option,
      }));
      await Question.insertMany(questions, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(savedExam); // 201 for resource creation
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      console.error('Database Error:', dbError);
      return res.status(500).json({ error: 'Failed to save exam to database. Please try again.' });
    }
  } catch (error) {
    console.error('OpenAI or General Error:', error);
    if (error.code === 'invalid_api_key' || error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenAI API key. Please check your configuration.' });
    }
    res.status(500).json({ error: 'Failed to generate exam due to an external service error. Please try again later.' });
  }
});

app.use('/api', examRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));