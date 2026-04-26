import { Sandbox } from '@e2b/code-interpreter';

/**
 * API handler for secure Python code execution via E2B.
 * Specifically optimized for Matplotlib scientific visualizations.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Initialize the E2B Sandbox
    const sb = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY
    });

    console.log("E2B Sandbox created, executing code...");

    // Execute the Python code
    // We expect the AI to write code that generates a plot.
    // e.g. plt.show() is captured by E2B
    const execution = await sb.runCode(code);

    // Close the sandbox immediately to save resources/credits
    await sb.close();

    console.log("E2B Execution complete. Results found:", execution.results.length);

    // Look for image results (Matplotlib/Plotly)
    // results[i].png is a base64 string
    const imageResult = execution.results.find(r => r.png || r.jpeg || r.svg);
    const logs = execution.logs;

    if (!imageResult) {
      return res.status(200).json({ 
        success: false, 
        error: "No visualization was generated. Ensure your code calls plt.show().",
        logs: logs
      });
    }

    return res.status(200).json({
      success: true,
      chartData: imageResult.png || imageResult.jpeg || imageResult.svg,
      logs: logs
    });

  } catch (error) {
    console.error("E2B Runtime Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
}
