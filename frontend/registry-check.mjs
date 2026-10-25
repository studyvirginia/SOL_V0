import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { defineRegistry } from "@json-render/react";

const solCatalog = defineCatalog(schema, {
  components: {
    Flashcards: {},
    MCQ: {},
  }
});

const { registry, handlers } = defineRegistry(solCatalog, {
  components: {
    Flashcards: () => null,
    MCQ: () => null,
  }
});

console.log("Registry keys:");
console.log(Object.keys(registry));
