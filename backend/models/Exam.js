const mongoose = require('mongoose');
const examSchema = new mongoose.Schema({
  title: String,
  description: String,
});
module.exports = mongoose.model('Exam', examSchema);