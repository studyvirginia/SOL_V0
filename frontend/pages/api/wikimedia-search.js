export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { visual_search_term, category_filter, preferred_mime } = req.body;
  
  if (!visual_search_term) return res.status(400).json({error: 'Missing visual_search_term'});

  try {
    // 1. STAGE A: The Ai Search Architect
    // Clean up category_filter in case the LLM included "Category:"
    let catFilterStr = "";
    if (category_filter) {
      const cleanCat = category_filter.replace(/^Category:/i, "").trim();
      if (cleanCat) {
        catFilterStr = `incategory:"${cleanCat}" `;
      }
    }

    // You can optionally add mime sorting, but standard robust text search is usually enough
    const searchQuery = `${catFilterStr}${visual_search_term}`.trim();
    
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srsearch=${encodeURIComponent(searchQuery)}&srlimit=1`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "SOLAssistant/2.0 (lincoln@studyvirginia.org) Bot" }
    });

    const searchData = await searchRes.json();

    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      return res.status(404).json({ error: "No verified images found in academic categories." });
    }

    const fileTitle = searchData.query.search[0].title;

    // 2. STAGE B: The Image Info Query / Validation
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|mime&titles=${encodeURIComponent(fileTitle)}`;
    const infoRes = await fetch(infoUrl, {
      headers: { "User-Agent": "SOLAssistant/2.0 (lincoln@studyvirginia.org) Bot" }
    });

    const infoData = await infoRes.json();
    const pages = infoData.query?.pages;
    if (!pages) return res.status(404).json({ error: "No verified images found." });

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page.imageinfo || page.imageinfo.length === 0) {
      return res.status(404).json({ error: "No verified images found." });
    }

    const imageinfo = page.imageinfo[0];
    const url = imageinfo.url;
    const sourceUrl = imageinfo.descriptionurl;
    const mime = imageinfo.mime;
    const extmetadata = imageinfo.extmetadata || {};

    // 3. Accuracy Shield Metadata Validation (Optional stricter checks could go here)
    // E.g., verifying if the categories on the file still match safety standards

    return res.status(200).json({
      url,
      sourceUrl,
      mime,
      attribution: extmetadata.Attribution?.value || "",
      license: extmetadata.LicenseShortName?.value || "",
      usageTerms: extmetadata.UsageTerms?.value || "",
      description: extmetadata.ImageDescription?.value || "",
      author: extmetadata.Artist?.value || "",
      fileTitle
    });

  } catch (error) {
    console.error("Wikimedia Backend Accuracy Shield Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
