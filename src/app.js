require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const notesRouter = require('./notes/notes-router')
const foldersRouter = require('./folders/folders-router')
const errorHandler = require('./errorHandler')
const validateBearerToken = require('./validateBearerToken')
const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.get('/', (req, res) => {
  res.send('Hello, world!')
})
app.use(validateBearerToken)
app.use('/api/notes', notesRouter)
app.use('/api/folders', foldersRouter)

app.use(errorHandler)

module.exports = app