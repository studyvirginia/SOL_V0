import axios from 'axios';

let cachedToken = null;
let tokenExpiresAt = null;

async function getAccessToken() {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.OPENVERSE_CLIENT_ID;
  const clientSecret = process.env.OPENVERSE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('Openverse credentials missing, falling back to anonymous access');
    return null;
  }

  try {
    const response = await axios.post('https://api.openverse.org/v1/auth_tokens/token/', 
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    cachedToken = response.data.access_token;
    // Expire slightly early to be safe (token is usually 3600s)
    tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
    return cachedToken;
  } catch (error) {
    console.error('Error fetching Openverse access token:', error?.response?.data || error.message);
    return null;
  }
}

/**
 * Search Openverse for an image
 * @param {string} query - The search query
 * @param {Object} options - Search options (license, category, etc.)
 */
export async function searchOpenverse(query, options = {}) {
  const token = await getAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await axios.get('https://api.openverse.org/v1/images/', {
      params: {
        q: query,
        page_size: 10, // Fetch more to increase chances of finding academic results
        license_type: 'commercial,modification',
        // Prioritize academic/reliable sources only.
        // phylopic: great for biology/evolution silhouettes
        // wellcome: medical/biological history
        // sciencemuseum: technology and science history
        source: 'wikimedia,smithsonian,met,clevelandmus,rawpixel,nasa,spacex,rijksmuseum,wellcome,sciencemuseum,phylopic,bio-diversity,mplus',
        ...options
      },
      headers
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Openverse search error:', error?.response?.data || error.message);
    return [];
  }
}
