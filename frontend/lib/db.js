import Dexie from 'dexie';

if (typeof window === 'undefined') {
  const { indexedDB, IDBKeyRange } = await import('fake-indexeddb');
  Dexie.dependencies.indexedDB = indexedDB;
  Dexie.dependencies.IDBKeyRange = IDBKeyRange;
}

export const db = new Dexie('SOL_Study_DB');

db.version(1).stores({
  sessions: 'id, course, focusDetail, createdAt'
});
