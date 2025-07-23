const mongoose = require('mongoose');
const answerSchema = new mongoose.Schema({
  result_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  selected_option: String,
  is_correct: Boolean,
});
module.exports = mongoose.model('Answer', answerSchema);