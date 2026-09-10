ALTER TABLE tasks ADD COLUMN updated_at INTEGER;

UPDATE tasks SET updated_at = created_at WHERE updated_at IS NULL;
