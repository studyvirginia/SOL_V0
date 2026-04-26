import axios from 'axios';

const TEST_CASES = [
  {
    domain: "Biology",
    query: "mitosis diagram",
    contextSnippet: "Mitosis is the process where a single cell divides into two identical daughter cells. It consists of stages like prophase, metaphase, anaphase, and telophase."
  },
  {
    domain: "Biology",
    query: "Antirrhinum majus",
    contextSnippet: "Snapdragons, or Antirrhinum majus, show incomplete dominance in their flower color. Crossing red and white flowers results in pink offspring."
  },
  {
    domain: "World History",
    query: "Roman Aqueduct Segovia",
    contextSnippet: "The Roman Aqueduct of Segovia is one of the best-preserved elevated Roman aqueducts and the foremost symbol of Segovia, Spain."
  },
  {
    domain: "World History",
    query: "Declaration of Independence original",
    contextSnippet: "The Declaration of Independence, adopted by the Continental Congress on July 4, 1776, announced that the thirteen American colonies were independent states."
  },
  {
    domain: "Physics",
    query: "convex lens ray diagram",
    contextSnippet: "A convex lens is a converging lens that focuses parallel rays of light to a single point called the principal focus."
  },
  {
    domain: "Space Science",
    query: "Pillars of Creation Hubble",
    contextSnippet: "The Pillars of Creation is a photograph taken by the Hubble Space Telescope of elephant trunks of interstellar gas and dust in the Eagle Nebula."
  },
  {
    domain: "Ancient History",
    query: "Rosetta Stone British Museum",
    contextSnippet: "The Rosetta Stone is a granodiorite stele found in 1799, inscribed with three versions of a decree issued in Memphis, Egypt."
  },
  {
    domain: "Chemistry",
    query: "periodic table of elements modern",
    contextSnippet: "The periodic table is a tabular display of the chemical elements, organized by atomic number and electron configuration."
  },
  {
    domain: "Art History",
    query: "The Starry Night Vincent van Gogh",
    contextSnippet: "The Starry Night is an oil-on-canvas painting by the Dutch Post-Impressionist painter Vincent van Gogh."
  },
  {
    domain: "Anatomy",
    query: "human heart diagram labeled",
    contextSnippet: "The human heart is a muscular organ which pumps blood through the blood vessels of the circulatory system."
  }
];

async function runMassTest() {
  console.log("🚀 Starting Mass Validation Test for Openverse Pipeline...");
  console.log("----------------------------------------------------------");

  const results = [];

  for (const test of TEST_CASES) {
    console.log(`\n🧪 Testing [${test.domain}]: "${test.query}"...`);
    try {
      const response = await axios.post('http://localhost:3001/api/openverse', {
        query: test.query,
        contextSnippet: test.contextSnippet
      }, {
        timeout: 60000 // Validation can take time
      });

      const data = response.data;
      console.log(`✅ SUCCESS`);
      console.log(`   Source: ${data.source} (${data.provider})`);
      console.log(`   Title:  ${data.title}`);
      console.log(`   Caption: ${data.caption}`);
      
      results.push({ ...test, status: 'SUCCESS', source: data.source });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      console.log(`❌ FAILED: ${errorMsg}`);
      results.push({ ...test, status: 'FAILED', error: errorMsg });
    }
  }

  console.log("\n----------------------------------------------------------");
  console.log("📊 Final Report:");
  const total = results.length;
  const passed = results.filter(r => r.status === 'SUCCESS').length;
  console.log(`   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log("🌟 All domains validated! The pipeline is robust and academic.");
  } else {
    console.log("⚠️ Some tests failed. Check for query relevance or source availability.");
  }
}

runMassTest();
