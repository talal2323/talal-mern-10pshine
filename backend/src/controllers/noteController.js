const Note = require('../models/Note');

// @desc    Get user's notes
// @route   GET /api/notes
const getNotes = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    let dbQuery = { user: req.user._id };

    if (search) {
      dbQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      dbQuery.category = category;
    }

    const notes = await Note.find(dbQuery).sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a note
// @route   POST /api/notes
const createNote = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    if (!req.body.title || !req.body.content) {
      res.status(400);
      throw new Error('Please add both title and content');
    }

    const note = await Note.create({
      title: req.body.title,
      content: req.body.content,
      category: category || 'Personal',
      user: req.user.id
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    // Make sure the logged-in user matches the note user
    if (note.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized to update this note');
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    // Make sure the logged-in user matches the note user
    if (note.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized to delete this note');
    }

    await note.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };