export const OPENVERSE_REQUEST_SCHEMA = `
CRITICAL: When the student needs a contextual, real-world visual (e.g., a primary source document, a photograph of a scientific concept, or a museum artifact), you MUST use the following token.

TOKEN FORMAT:
%%IMAGE%%{"visual_search_term": "detailed English search query", "caption": "Educational caption for the image", "source": "museum|science|general", "extension": "jpg|png"}%%END_IMAGE%%

RULES:
1. Use "museum" for history/art (queries Metropolitan Museum, Smithsonian).
2. Use "science" for biology/physics (queries NASA, iNaturalist).
3. Use "general" for everything else.
4. The visual_search_term should be descriptive but concise (e.g., "Abraham Lincoln Matthew Brady photograph" not just "Lincoln").
5. Do NOT use this for algebraic graphs or geometric diagrams (use %%GRAPH%% for those).
`;
