const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const db = require('../store')
const {folders, notes} = db();

const notesRouter = express.Router()
const bodyParser = express.json()

notesRouter
  .route('/notes')
  .get((req, res) => {
    res.json(notes);
  })
  .post(bodyParser, (req, res) => {
    for (let field of ['name', 'modified', 'folderId', 'content']) {
        if (!req.body[field]){
            logger.error(`${field} is required`)
            return res.status(400).send(`'${field}' is required`)
        }
    }
    const { name, modified, folderId, content } = req.body;

    for (let note of notes){
        if (note.name === name && note.folderId === folderId ){
            logger.error(`${name} is a repeated note in the same folder`)
            return res.status(400).send(`'${name}' has already been used in this folder`)
        }
    }

    const foldersIndex = folders.findIndex(f => f.id == folderId);
    if (foldersIndex === -1) {
        logger.error(`Folder with id ${folderId} not found.`);
        return res
          .status(404)
          .send('Please add note in an existing folder');
    }
    if (content.length < 5) {
        logger.error(`The length of 'content' is less than 5`)
        return res.status(400).send(`The length of 'content' should be at least 5`)
    }

    const id = uuid();

    const note = {
        id,
        name,
        modified,
        folderId,
        content
    };

    notes.push(note);
    logger.info(`Note with id ${id} created`);
    res
        .status(201)
        .location(`http://localhost:8000/notes/${id}`)
        .json(note);
})

notesRouter
  .route('/notes/:id')
  .get((req, res) => {
    const { id } = req.params;
    const note = notes.find(n => n.id == id);
  
    // make sure we found a card
    if (!note) {
      logger.error(`Note with id ${id} not found.`);
      return res
        .status(404)
        .send('Note Not Found');
    }
  
    res.json(note);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const noteIndex = notes.findIndex(n => n.id == id);

    if (noteIndex === -1) {
        logger.error(`Note with id ${id} not found.`);
        return res
        .status(404)
        .send('Not found');
    }

    notes.splice(noteIndex, 1);

    logger.info(`Card with id ${id} deleted.`);

    res
        .status(204)
        .end();
  })

module.exports = notesRouter