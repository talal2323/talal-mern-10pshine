const express = require('express');
const router = express.Router();
const { getNotes, createNote, updateNote, deleteNote, exportNotes, importNotes } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// Add the 'protect' middleware to all routes
router.route('/').get(protect, getNotes).post(protect, createNote);
router.get('/export', protect, exportNotes);
router.post('/import', protect, importNotes);
router.route('/:id').put(protect, updateNote).delete(protect, deleteNote);

module.exports = router;