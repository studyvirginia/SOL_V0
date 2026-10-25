const { defineCatalog } = require('@json-render/core');
const { defineRegistry } = require('@json-render/react');
const solCatalog = defineCatalog({}, { components: { Flashcards: {} } });
try {
  defineRegistry(solCatalog, { components: { Flashcards: () => null } });
  console.log("Success defineRegistry");
} catch(e) {
  console.error("Error", e);
}
