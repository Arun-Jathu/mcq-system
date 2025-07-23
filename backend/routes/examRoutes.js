const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Answer = require('../models/Answer');

// Get list of exams
router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get questions for an exam
router.get('/exams/:id/questions', async (req, res) => {
  try {
    const questions = await Question.find({ exam_id: req.params.id });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Submit answers and calculate result
router.post('/exams/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    const examId = new mongoose.Types.ObjectId(req.params.id);
    const result = new Result({
      user_id: new mongoose.Types.ObjectId('64b8c2620a3be2a2a8cd94d0'),
      exam_id: examId,
    });
    await result.save();
    console.log('Result saved:', result._id);

    let score = 0;
    const answerPromises = answers.map(async (answer) => {
      if (!answer.question_id || !answer.selected_option) {
        throw new Error('Invalid answer format');
      }

      let questionId;
      try {
        questionId = new mongoose.Types.ObjectId(answer.question_id);
      } catch (err) {
        throw new Error(`Invalid question ID: ${answer.question_id}`);
      }

      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error(`Question ${answer.question_id} not found`);
      }

      const is_correct = question.correct_option === answer.selected_option;
      if (is_correct) score++;

      const newAnswer = new Answer({
        result_id: result._id,
        question_id: questionId,
        selected_option: answer.selected_option,
        is_correct,
      });
      const savedAnswer = await newAnswer.save();
      console.log('Answer saved:', savedAnswer._id);
      return savedAnswer._id;
    });

    await Promise.all(answerPromises);

    result.score = score;
    await result.save();

    res.json({
      message: 'Submission successful',
      score,
      result_id: result._id,
      totalQuestions: answers.length,
    });
  } catch (error) {
    console.error('Submission error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get result details
router.get('/exams/result/:result_id', async (req, res) => {
  try {
    const result = await Result.findById(req.params.result_id).populate('answers');
    if (!result) return res.status(404).json({ error: 'Result not found' });

    const answers = await Answer.find({ result_id: result._id }).populate('question_id');
    res.json({
      score: result.score,
      totalQuestions: answers.length,
      answers,
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

module.exports = router;