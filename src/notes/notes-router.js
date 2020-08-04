const express = require('express')
const path = require('path')
const xss = require('xss')
const logger = require('../logger')
const NotesService = require('./notes-service')
const formatName = require('../formatName')
const validateName = require('../validateName')
const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  content: xss(note.content),
  modified: note.modified,
  folderId: Number(note.folderId),
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, folderId, content = "" } = req.body
    const newNote = { name, folderId, content }

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    const newName= formatName(name);
    const errMessage = validateName(newName);
    if (errMessage) {
      return res.status(400).json({
        error: { message: `${errMessage}` }
      })
    }
    newNote.name = newName;
    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note))
      })
      .catch(next)
  })
  


notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NotesService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.params.note_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name, content, folderId } = req.body
    const noteToUpdate = { name, folderId }
    
    // console.log('ok')
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
        return res.status(400).json({
        error: {
            message: `Request body must contain both 'name' and 'content'`
        }
        })
    }
    noteToUpdate.content = content
    // else noteToUpdate.content = ""
    const newName= formatName(name);
    const errMessage = validateName(newName);
    if (errMessage) {
      return res.status(400).json({
        error: { message: `${errMessage}` }
      })
    }
    noteToUpdate.name = newName;
    // noteToUpdate.modified = new Date();
    // console.log(noteToUpdate)
    NotesService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter