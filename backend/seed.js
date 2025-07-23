const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exam = require('./models/Exam');
const Question = require('./models/Question');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Exam.deleteMany();
    await Question.deleteMany();

    // Sample exams
    const exams = [
      {
        title: 'Math Test',
        description: 'Basic math questions',
      },
      {
        title: 'Science Test',
        description: 'Basic science questions',
      },
    ];

    const insertedExams = await Exam.insertMany(exams);

    // Sample questions for each exam
    const questions = [
      ...insertedExams[0]._id ? [
        { exam_id: insertedExams[0]._id, question_text: 'What is 2+2?', options: ['2', '3', '4', '5'], correct_option: '4' },
        { exam_id: insertedExams[0]._id, question_text: 'What is 5-3?', options: ['1', '2', '3', '4'], correct_option: '2' },
        { exam_id: insertedExams[0]._id, question_text: 'What is 3*4?', options: ['10', '12', '15', '18'], correct_option: '12' },
        { exam_id: insertedExams[0]._id, question_text: 'What is 10/2?', options: ['4', '5', '6', '7'], correct_option: '5' },
        { exam_id: insertedExams[0]._id, question_text: 'What is 6+7?', options: ['12', '13', '14', '15'], correct_option: '13' },
      ] : [],
      ...insertedExams[1]._id ? [
        { exam_id: insertedExams[1]._id, question_text: 'What is H2O?', options: ['Water', 'Oxygen', 'Hydrogen', 'Carbon'], correct_option: 'Water' },
        { exam_id: insertedExams[1]._id, question_text: 'What gas do plants absorb?', options: ['O2', 'CO2', 'N2', 'H2'], correct_option: 'CO2' },
        { exam_id: insertedExams[1]._id, question_text: 'What is the sun?', options: ['Planet', 'Star', 'Moon', 'Asteroid'], correct_option: 'Star' },
        { exam_id: insertedExams[1]._id, question_text: 'What is DNA?', options: ['Protein', 'Acid', 'Genetic Material', 'Enzyme'], correct_option: 'Genetic Material' },
        { exam_id: insertedExams[1]._id, question_text: 'What planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], correct_option: 'Mars' },
      ] : [],
    ];

    await Question.insertMany(questions);
    console.log('Database seeded with exams and questions');
    mongoose.connection.close();
  })
  .catch((err) => console.error('Seeding error:', err));