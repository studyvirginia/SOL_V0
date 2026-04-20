const { defineCatalog } = require("@json-render/core");
const { schema } = require("@json-render/react/schema");
const { z } = require("zod");

const solCatalog = defineCatalog(schema, {
  components: {
    Flashcards: {
      props: z.object({
        cards: z.array(z.object({
          front: z.string(),
          back: z.string()
        }))
      }),
      description: "Flashcards"
    }
  }
});

console.log(solCatalog.prompt());
