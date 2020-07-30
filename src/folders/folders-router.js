const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const db = require('../store')
const {folders} = db();

const foldersRouter = express.Router()
const bodyParser = express.json()

foldersRouter
  .route('/folders')
  .get((req, res) => {
    res.json(folders);
  })
  .post(bodyParser, (req, res) => {
    const { name } = req.body;
    if (!name){
        logger.error(`'name' is required`)
        return res.status(400).send(`'name' is required`)
    }

    for (let folder of folders){
        if (folder.name === name){
            logger.error(`${name} is a repeated folder name`)
            return res.status(400).send(`${name} has already been used`)
        }
    }
    const id = uuid();

    const folder = {
        id,
        name
    };

    folders.push(folder);
    logger.info(`Folder with id ${id} created`);
    res
        .status(201)
        .location(`http://localhost:8000/folders/${id}`)
        .json(folder);
})

foldersRouter
  .route('/folders/:id')
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

module.exports = foldersRouter