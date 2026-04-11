export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { query } = req.body;
  if (!query) return res.status(400).json({error: 'Missing query'});

  try {
    // Search Wikimedia Commons with the specific query, limiting to Namespace 6 (File)
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata`;
    
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "SOLAssistant/1.0 (lincoln@studyvirginia.org) Bot"
      }
    });

    const data = await response.json();
    
    if (!data.query || !data.query.pages) {
      return res.status(404).json({ error: "No image found for the query." });
    }

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page.imageinfo || page.imageinfo.length === 0) {
      return res.status(404).json({ error: "No image info found in API response." });
    }

    const imageinfo = page.imageinfo[0];
    const url = imageinfo.url;
    const sourceUrl = imageinfo.descriptionurl;
    const extmetadata = imageinfo.extmetadata || {};
    
    return res.status(200).json({
      url,
      sourceUrl,
      attribution: extmetadata.Attribution?.value || "",
      license: extmetadata.LicenseShortName?.value || "",
      description: extmetadata.ImageDescription?.value || "",
      author: extmetadata.Artist?.value || ""
    });

  } catch (error) {
    console.error("Wikimedia API Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
