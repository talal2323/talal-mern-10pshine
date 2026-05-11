const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a text value for the title']
  },
  content: {
    type: String,
    required: [true, 'Please add a text value for the content']
  },
  category: {
    type: String,
    default: 'Personal',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);