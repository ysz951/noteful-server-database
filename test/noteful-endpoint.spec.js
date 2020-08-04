const knex = require('knex')
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')
const app = require('../src/app')

describe.only('Bookmarks Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))


    describe(`Unauthorized requests`, () => {
        const testNotes =  makeNotesArray()
        const testFolders = makeFoldersArray()
        it(`responds with 401 Unauthorized for GET /api/folders`, () => {
            return supertest(app)
            .get('/api/folders')
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for GET /api/notes`, () => {
            return supertest(app)
            .get('/api/notes')
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for POST /api/floders`, () => {
            return supertest(app)
            .post('/api/folders')
            .send({ name: 'test-title' })
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for POST /api/notes`, () => {
            return supertest(app)
            .post('/api/notes')
            .send({ name: 'test-title', content: 'test-content', folderId: 2 })
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for GET /api/notes/:note_id`, () => {
            const secondNote = testNotes[1]
            return supertest(app)
            .get(`/api/notes/${secondNote.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for GET /api/folders/:folder_id`, () => {
            const secondFolder = testFolders[1]
            return supertest(app)
            .get(`/api/notes/${secondFolder.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for DELETE /api/notes/:note_id`, () => {
            const aNote = testNotes[1]
            return supertest(app)
            .delete(`/api/notes/${aNote.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for DELETE /api/folders/:folder_id`, () => {
            const aFolder= testFolders[1]
            return supertest(app)
            .delete(`/api/notes/${aFolder.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for PATCH /api/folders/:folder_id`, () => {
            return supertest(app)
            .patch('/api/folders/1')
            .send({ name: 'test-title' })
            .expect(401, { error: 'Unauthorized request' })
        })
        it(`responds with 401 Unauthorized for PATCH /api/noters/:note_id`, () => {
            return supertest(app)
            .patch('/api/notes/1')
            .send({ name: 'test-title', content: 'test-content', folderId: 2 })
            .expect(401, { error: 'Unauthorized request' })
        })
    })
    describe(`GET /api/notes`, () => {
        
        context(`Given no notes`, () => {
          it(`responds with 200 and an empty list`, () => {
            return supertest(app)
              .get('/api/notes')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(200, [])
          })
        })
        context('Given there are notes in the database', () => {
            const testNotes =  makeNotesArray()
            const testFolders = makeFoldersArray()
            beforeEach('insert notes', () => {
              return db
                .into('noteful_folders')
                .insert(testFolders)
                .then(() => {
                  return db
                    .into('noteful_notes')
                    .insert(testNotes)
                })
            })
            it('responds with 200 and all of the notes', () => {
              return supertest(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, testNotes)
            })
        })
        context(`Given an XSS attack note`, () => {
            const { maliciousNote, expectedNote } = makeMaliciousNote()
            const testFolders = makeFoldersArray();
            beforeEach('insert malicious note', () => {
              return db
                .into('noteful_folders')
                .insert(testFolders)
                .then(() => {
                  return db
                    .into('noteful_notes')
                    .insert([ maliciousNote ])
                })
            })
      
            it('removes XSS attack content', () => {
              return supertest(app)
                .get(`/api/notes`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                  expect(res.body[0].name).to.eql(expectedNote.name)
                  expect(res.body[0].content).to.eql(expectedNote.content)
                })
            })
          })
    })
    describe(`GET /api/notes/:note_id`, () => {
        context(`Given no notes`, () => {
          it(`responds with 404`, () => {
            const noteId = 123456
            return supertest(app)
              .get(`/api/notes/${noteId}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(404, { error: { message: `Note doesn't exist` } })
          })
        })
    
        context('Given there are notes in the database', () => {
          const testFolders = makeFoldersArray();
          const testNotes = makeNotesArray()
    
          beforeEach('insert notes', () => {
            return db
              .into('noteful_folders')
              .insert(testFolders)
              .then(() => {
                return db
                  .into('noteful_notes')
                  .insert(testNotes)
              })
          })
    
          it('responds with 200 and the specified note', () => {
            const noteId = 2
            const expectedNote = testNotes[noteId - 1]
            return supertest(app)
              .get(`/api/notes/${noteId}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(200, expectedNote)
          })
        })
    
        context(`Given an XSS attack note`, () => {
          const testFolders = makeFoldersArray();
          const { maliciousNote, expectedNote } = makeMaliciousNote()
    
          beforeEach('insert malicious note', () => {
            return db
              .into('noteful_folders')
              .insert(testFolders)
              .then(() => {
                return db
                  .into('noteful_notes')
                  .insert([ maliciousNote ])
              })
          })
    
          it('removes XSS attack content', () => {
            return supertest(app)
              .get(`/api/notes/${maliciousNote.id}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(200)
              .expect(res => {
                expect(res.body.name).to.eql(expectedNote.name)
                expect(res.body.content).to.eql(expectedNote.content)
              })
          })
        })
    })
    describe(`POST /api/notes`, () => {
        const testFolders = makeFoldersArray();
        beforeEach('insert malicious note', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })
    
        it(`creates an note, responding with 201 and the new note`, () => {
          const newNote = {
            name: 'Test New Note',
            content: 'Test new content',
            folderId: 1
          }
          return supertest(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send(newNote)
            .expect(201)
            .expect(res => {
              expect(res.body.name).to.eql(newNote.name)
              expect(res.body.content).to.eql(newNote.content)
              expect(res.body.folderId).to.eql(newNote.folderId)
              expect(res.body).to.have.property('id')
              expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
              const expected = new Intl.DateTimeFormat('en-US').format(new Date())
              const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.modified))
              expect(actual).to.eql(expected)
            })
            .then(res =>
              supertest(app)
                .get(`/api/notes/${res.body.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(res.body)
            )
        })
    
        const requiredFields = ['name', 'folderId']
    
        requiredFields.forEach(field => {
          const newNote = {
            name: 'Test New Note',
            content: 'Test new content',
            folderId: 1
          }
    
          it(`responds with 400 and an error message when the '${field}' is missing`, () => {
            delete newNote[field]
    
            return supertest(app)
              .post('/api/notes')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .send(newNote)
              .expect(400, {
                error: { message: `Missing '${field}' in request body` }
              })
          })
        })
        
        it('removes XSS attack content from response', () => {
          const { maliciousNote, expectedNote } = makeMaliciousNote()
          return supertest(app)
            .post(`/api/notes`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send(maliciousNote)
            .expect(201)
            .expect(res => {
              expect(res.body.name).to.eql(expectedNote.name)
              expect(res.body.content).to.eql(expectedNote.content)
            })
        })
    })
    describe(`DELETE /api/notes/:note_id`, () => {
        context(`Given no notes`, () => {
          it(`responds with 404`, () => {
            const noteId = 123456
            return supertest(app)
              .delete(`/api/notes/${noteId}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(404, { error: { message: `Note doesn't exist` } })
          })
        })
    
        context('Given there are notes in the database', () => {
          const testFolders = makeFoldersArray();
          const testNotes = makeNotesArray()
    
          beforeEach('insert notes', () => {
            return db
              .into('noteful_folders')
              .insert(testFolders)
              .then(() => {
                return db
                  .into('noteful_notes')
                  .insert(testNotes)
              })
          })
    
          it('responds with 204 and removes the note', () => {
            const idToRemove = 2
            const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
            return supertest(app)
              .delete(`/api/notes/${idToRemove}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/notes`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(expectedNotes)
              )
          })
        })
    })
    describe(`PATCH /api/notes/:note_id`, () => {
        context(`Given no notes`, () => {
          it(`responds with 404`, () => {
            const noteId = 123456
            return supertest(app)
              .delete(`/api/notes/${noteId}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(404, { error: { message: `Note doesn't exist` } })
          })
        })
    
        context('Given there are notes in the database', () => {
          const testFolders = makeFoldersArray();
          const testNotes = makeNotesArray()
    
          beforeEach('insert notes', () => {
            return db
              .into('noteful_folders')
              .insert(testFolders)
              .then(() => {
                return db
                  .into('noteful_notes')
                  .insert(testNotes)
              })
          })
    
          it('responds with 204 and updates the note', () => {
            const idToUpdate = 2
            const updateNote = {
              name: 'Updated Note Title',
              content: 'updated note content',
              folderId: 2,
            }
            const expectedNote = {
              ...testNotes[idToUpdate - 1],
              ...updateNote
            }
            return supertest(app)
              .patch(`/api/notes/${idToUpdate}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .send(updateNote)
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/notes/${idToUpdate}`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(expectedNote)
              )
          })
    
          it(`responds with 400 when no required fields supplied`, () => {
            const idToUpdate = 2
            return supertest(app)
              .patch(`/api/notes/${idToUpdate}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .send({ irrelevantField: 'foo' })
              .expect(400, {
                error: {
                  message: `Request body must contain both 'name' and 'content'`
                }
              })
          })
    
          it(`responds with 204 when updating only a subset of fields`, () => {
            const idToUpdate = 2
            const updateNote = {
              name: 'Updated Note Title',
              folderId: 2,
            }
            const expectedNote = {
              ...testNotes[idToUpdate - 1],
              ...updateNote
            }
    
            return supertest(app)
              .patch(`/api/notes/${idToUpdate}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .send({
                ...updateNote,
                fieldToIgnore: 'should not be in GET response'
              })
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/notes/${idToUpdate}`)
                  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                  .expect(expectedNote)
              )
          })
        })
      })
})
