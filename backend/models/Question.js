const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  question_text: String,
  options: [String],
  correct_option: String,
});
module.exports = mongoose.model('Question', questionSchema);