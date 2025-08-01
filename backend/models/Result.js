const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, 
  score: Number,
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
});

module.exports = mongoose.model('Result', resultSchema);