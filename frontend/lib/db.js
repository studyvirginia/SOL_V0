import Dexie from 'dexie';

export const db = new Dexie('SOL_Study_DB');

db.version(1).stores({
  sessions: 'id, course, focusDetail, createdAt'
});
