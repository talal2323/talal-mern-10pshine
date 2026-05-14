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
    const io = req.app.get('socketio');
    io.emit('task_status_changed', updatedNote);

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

// @desc    Export all user notes as a JSON file
// @route   GET /api/notes/export
const exportNotes = async (req, res, next) => {
  try {
    // Fetch all notes for this user, but EXCLUDE the MongoDB _id and __v fields.
    const notes = await Note.find({ user: req.user.id }).select('title content category -_id');

    // Set the headers to tell the browser to download this as a file
    res.setHeader('Content-Disposition', 'attachment; filename=my_notes_export.json');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).send(JSON.stringify(notes, null, 2));
  } catch (error) {
    next(error);
  }
};

// @desc    Import an array of notes
// @route   POST /api/notes/import
const importNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      res.status(400);
      throw new Error('Please provide a valid array of notes to import');
    }

    // Map through the uploaded notes and attach the current logged-in user's ID
    const notesToImport = notes.map((note) => ({
      title: note.title || 'Untitled Note',
      content: note.content || '',
      category: note.category || 'General',
      user: req.user.id,
    }));

    // Use MongoDB's bulk insert for massive performance gains
    const importedNotes = await Note.insertMany(notesToImport);

    // Optional: Emit a socket event so the UI refreshes instantly if they have multiple tabs open
    const io = req.app.get('socketio');
    if (io) {
      io.emit('notes_bulk_imported');
    }

    res.status(201).json({
      message: 'Notes imported successfully',
      count: importedNotes.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote, exportNotes, importNotes };