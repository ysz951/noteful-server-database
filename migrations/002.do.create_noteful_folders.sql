CREATE TABLE noteful_folders (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL UNIQUE
);
ALTER TABLE noteful_notes
  ADD COLUMN
    "folderId" INTEGER REFERENCES noteful_folders(id)
    ON DELETE CASCADE NOT NULL;
CREATE UNIQUE INDEX notes_folder_name ON noteful_notes("folderId", name);