import { searchOpenverse } from '../../lib/openverseService';
import { validateImage } from '../../lib/imageValidationService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, contextSnippet } = req.body;

  if (!query || !contextSnippet) {
    return res.status(400).json({ error: 'Missing query or contextSnippet' });
  }

  try {
    const results = await searchOpenverse(query);
    
    if (!results.length) {
      return res.status(404).json({ error: 'No images found' });
    }

    // Try to validate the top results until one passes
    for (let i = 0; i < Math.min(results.length, 3); i++) {
      const validated = await validateImage(results[i], contextSnippet);
      if (validated) {
        return res.status(200).json(validated);
      }
    }

    return res.status(422).json({ error: 'No images met the quality/relevance threshold' });
  } catch (error) {
    console.error('API [openverse] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
