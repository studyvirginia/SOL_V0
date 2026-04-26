import { Sandbox } from '@e2b/code-interpreter';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const E2B_API_KEY = process.env.E2B_API_KEY;

async function testE2B() {
  console.log("🚀 Initializing E2B Sandbox...");
  console.log("Using API Key:", E2B_API_KEY ? "EXISTS (starts with " + E2B_API_KEY.slice(0, 8) + ")" : "MISSING");

  if (!E2B_API_KEY) {
    console.error("❌ Error: E2B_API_KEY not found in .env.local");
    return;
  }

  let sb;
  try {
    sb = await Sandbox.create({ apiKey: E2B_API_KEY });
    console.log("✅ Sandbox created successfully. ID:", sb.sandboxId);

    const code = `
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y)
plt.title("E2B Test Plot")
plt.show()
    `;

    console.log("🏃 Running Python code...");
    const execution = await sb.runCode(code);
    
    console.log("📊 Execution results:");
    console.log("- Logs:", execution.logs.stdout);
    console.log("- Errors:", execution.logs.stderr);
    console.log("- Results count:", execution.results.length);

    if (execution.results.length > 0) {
      const chart = execution.results[0];
      if (chart.png) {
        console.log("✅ Chart generated! (PNG base64 length:", chart.png.length, ")");
      } else {
        console.log("⚠️ Result found but no PNG data.");
        console.log("Keys in result:", Object.keys(chart));
      }
    } else {
      console.log("❌ No results returned from execution.");
    }

  } catch (error) {
    console.error("❌ Sandbox Error:", error);
  } finally {
    if (sb) {
      console.log("🧹 Killing sandbox...");
      await sb.kill();
      console.log("👋 Sandbox killed.");
    }
  }
}

testE2B();
