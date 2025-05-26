const notesRouter = require("express").Router();
const Note = require("../models/note");
const User = require("../models/user");

notesRouter.get("/", async (request, response) => {
  const notes = await Note.find({}).populate("user", { username: 1, name: 1 });
  response.json(notes);
});

notesRouter.get("/:id", async (request, response, next) => {
  try {
    const note = await Note.findById(request.params.id);
    if (note) {
      response.json(note);
    } else {
      response.status(404).end();
    }
  } catch (exception) {
    next(exception);
  }
});

notesRouter.post("/", async (request, response, next) => {
  const { content, important, userId } = request.body;

  const user = await User.findById(userId);

  const note = new Note({
    content: content,
    important: important || false,
    user: user.id,
  });

  try {
    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();
    response.status(201).json(savedNote);
  } catch (exception) {
    next(exception);
  }
});

notesRouter.delete("/:id", async (request, response, next) => {
  try {
    await Note.findByIdAndDelete(request.params.id);

    response.status(204).end();
  } catch (exception) {
    next(exception);
  }
});

notesRouter.put("/:id", async (request, response, next) => {
  const { content, important } = request.body;
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      request.params.id,
      { content: content, important: important },
      { new: true }
    );
    response.json(updatedNote);
  } catch (exception) {
    next(exception);
  }
});

module.exports = notesRouter;
