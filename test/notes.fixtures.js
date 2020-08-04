function makeNotesArray() {
    return [
      {
        id: 1,
        name: "Dogs",
        content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non. Adipisci, pariatur. Molestiae, libero esse hic adipisci autem neque?",
        modified: "2020-08-04T03:41:15.116Z",
        folderId: 1
      },
      {
        id: 2,
        name: "Cats",
        content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non. Adipisci, pariatur. Molestiae, libero esse hic adipisci autem neque?",
        modified: "2020-08-04T03:41:15.116Z",
        folderId: 2
      },
      {
        id: 3,
        name: "Pigs",
        content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non. Adipisci, pariatur. Molestiae, libero esse hic adipisci autem neque?",
        modified: "2020-08-04T03:41:15.116Z",
        folderId: 3
      },
    ]
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    name: 'Naughty Naughty Very Naughty',
    modified: new Date().toISOString(),
    folderId: 1,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedNote = {
    ...maliciousNote,
    name: 'Naughty Naughty Very Naughty',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousNote,
    expectedNote,
  }
}
module.exports = {
  makeNotesArray,
  makeMaliciousNote
}