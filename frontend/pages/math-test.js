import React, { useState, useEffect } from 'react';
import MathVisual from '../components/learning/MathVisual';
import PythonVisual from '../components/learning/PythonVisual';

// Categorized test suite to cover the full Virginia SOL Math spectrum
const TEST_SUITE = {
  "Algebra 1 & 2": [
    {
      id: "alg-linear-sys",
      title: "A.EI.2: Systems of Equations",
      config: {
        title: "Intersection of y=x+1 and y=-x+5",
        viewBox: { x: [-1, 6], y: [-1, 7] },
        layers: [
          { type: "function", props: { fn: "x + 1", color: "blue" } },
          { type: "function", props: { fn: "-x + 5", color: "red" } },
          { type: "point", props: { x: 2, y: 3, label: "Solution (2, 3)", color: "purple" } }
        ]
      }
    },
    {
      id: "alg-inequality",
      title: "A.EI.1: Linear Inequalities",
      config: {
        title: "Shaded Region: y > 2x - 3",
        viewBox: { x: [-5, 5], y: [-5, 5] },
        layers: [
          { type: "function", props: { fn: "2*x - 3", color: "blue", opacity: 0.5 } },
          { type: "polygon", props: { points: [[-1, 5], [5, 5], [5, 7], [-1, 7]], color: "blue", fillOpacity: 0.1 } },
          { type: "text", props: { x: 0, y: 2, text: "Solution Set" } }
        ]
      }
    },
    {
      id: "alg-log",
      title: "A2.F.1: Logarithmic Functions",
      config: {
        title: "y = log2(x)",
        viewBox: { x: [-1, 10], y: [-4, 4] },
        layers: [
          { type: "function", props: { fn: "log(x)/log(2)", color: "emerald" } },
          { type: "line", props: { point: [0, 0], slope: 999, style: "dashed", color: "slate" } }, // Asymptote
          { type: "point", props: { x: 1, y: 0, label: "(1, 0)" } }
        ]
      }
    }
  ],
  "Geometry": [
    {
      id: "geo-tri",
      title: "G.5: Triangle Congruence",
      config: {
        title: "SAS Congruence Visualization",
        viewBox: { x: [-1, 10], y: [-1, 6] },
        layers: [
          { type: "polygon", props: { points: [[1, 1], [5, 1], [3, 4]], color: "blue" } },
          { type: "polygon", props: { points: [[6, 1], [10, 1], [8, 4]], color: "blue" } },
          { type: "text", props: { x: 3, y: 0.5, text: "Side c" } },
          { type: "text", props: { x: 8, y: 0.5, text: "Side c'" } }
        ]
      }
    },
    {
      id: "geo-circle",
      title: "G.11: Circle Properties",
      config: {
        title: "Inscribed Angle Theorem",
        viewBox: { x: [-5, 5], y: [-5, 5] },
        layers: [
          { type: "polygon", props: { points: Array.from({length: 40}, (_, i) => [4 * Math.cos(i * 2 * Math.PI / 40), 4 * Math.sin(i * 2 * Math.PI / 40)]), fillOpacity: 0.05, color: "slate" } },
          { type: "line", props: { point1: [0, 4], point2: [-3.46, -2], color: "orange" } },
          { type: "line", props: { point1: [0, 4], point2: [3.46, -2], color: "orange" } },
          { type: "point", props: { x: 0, y: 0, label: "Center" } }
        ]
      }
    }
  ],
  "Trigonometry & Analysis": [
    {
      id: "trig-unit",
      title: "T.1: The Unit Circle",
      config: {
        title: "Unit Circle (Radius = 1)",
        viewBox: { x: [-1.5, 1.5], y: [-1.5, 1.5] },
        layers: [
          { type: "polygon", props: { points: Array.from({length: 60}, (_, i) => [Math.cos(i * 2 * Math.PI / 60), Math.sin(i * 2 * Math.PI / 60)]), color: "slate", fillOpacity: 0.1 } },
          { type: "vector", props: { tip: [0.707, 0.707], color: "rose" } },
          { type: "text", props: { x: 0.8, y: 0.8, text: "π/4 (45°)" } }
        ]
      }
    },
    {
      id: "trig-spiral",
      title: "MA.5: Parametric Spirals",
      config: {
        title: "Archimedean Spiral",
        gridType: "polar",
        viewBox: { x: [-10, 10], y: [-10, 10] },
        layers: [
          { type: "polar", props: { fn: "0.5 * t", color: "amber", opacity: 0.8 } }
        ]
      }
    }
  ],
  "Physics & Vectors": [
    {
      id: "phys-field",
      title: "PH.1: Vector Fields",
      config: {
        title: "Simple Magnetic Field Representation",
        viewBox: { x: [-5, 5], y: [-5, 5] },
        layers: [
          { type: "vector", props: { tail: [-2, 2], tip: [-1, 2.5], color: "blue" } },
          { type: "vector", props: { tail: [0, 2], tip: [1, 2], color: "blue" } },
          { type: "vector", props: { tail: [2, 2], tip: [3, 1.5], color: "blue" } },
          { type: "point", props: { x: 0, y: 0, label: "Dipole Center", color: "red" } }
        ]
      }
    }
  ],
  "Grade 3-8 Foundations": [
    {
      id: "gr3-fraction",
      title: "3.NS.2: Fractions on a Number Line",
      config: {
        title: "Show 3/4 on a number line",
        viewBox: { x: [-0.5, 1.5], y: [-1, 1] },
        layers: [
          { type: "line", props: { point1: [0, 0], point2: [1, 0], color: "slate" } },
          { type: "point", props: { x: 0, y: 0, label: "0" } },
          { type: "point", props: { x: 1, y: 0, label: "1" } },
          { type: "point", props: { x: 0.75, y: 0, label: "3/4", color: "blue" } },
          { type: "vector", props: { tip: [0.75, 0], color: "blue", opacity: 0.3 } }
        ]
      }
    },
    {
      id: "gr6-coord",
      title: "6.NS.1: Coordinate Planes",
      config: {
        title: "Plotting in Four Quadrants",
        viewBox: { x: [-5, 5], y: [-5, 5] },
        layers: [
          { type: "point", props: { x: 2, y: 3, label: "Q1", color: "emerald" } },
          { type: "point", props: { x: -2, y: 3, label: "Q2", color: "blue" } },
          { type: "point", props: { x: -2, y: -3, label: "Q3", color: "rose" } },
          { type: "point", props: { x: 2, y: -3, label: "Q4", color: "amber" } }
        ]
      }
    }
  ],
  "Algebraic Operations": [
    {
      id: "alg-abs",
      title: "A.EO.1: Absolute Value",
      config: {
        title: "Evaluating |x - 3| + 2",
        viewBox: { x: [-5, 10], y: [-1, 10] },
        layers: [
          { type: "function", props: { fn: "abs(x - 3) + 2", color: "purple" } },
          { type: "point", props: { x: 3, y: 2, label: "Vertex (3, 2)", color: "rose" } }
        ]
      }
    },
    {
      id: "alg-quad-roots",
      title: "A.EO.2: Quadratic Zeroes",
      config: {
        title: "y = x² - 4",
        viewBox: { x: [-5, 5], y: [-5, 5] },
        layers: [
          { type: "function", props: { fn: "x^2 - 4", color: "blue" } },
          { type: "point", props: { x: 2, y: 0, label: "Root (2,0)", color: "red" } },
          { type: "point", props: { x: -2, y: 0, label: "Root (-2,0)", color: "red" } }
        ]
      }
    }
  ],
  "Data Science & Stats": [
    {
      id: "ds-normal",
      title: "DS.11: Normal Distribution",
      engine: "python",
      config: {
        title: "Standard Normal Curve (μ=0, σ=1)",
        code: "import matplotlib.pyplot as plt\nimport numpy as np\nfrom scipy.stats import norm\n\nx = np.linspace(-4, 4, 100)\ny = norm.pdf(x, 0, 1)\n\nplt.figure(figsize=(10, 6))\nplt.plot(x, y, 'b-', lw=2)\nplt.fill_between(x, y, color='blue', alpha=0.2)\nplt.title('Standard Normal Distribution')\nplt.grid(True, alpha=0.3)\nplt.show()",
        caption: "A normal distribution showing the probability density function."
      }
    },
    {
      id: "ds-box",
      title: "DS.10: Box & Whisker Plot",
      engine: "python",
      config: {
        title: "Comparative Study Data",
        code: "import matplotlib.pyplot as plt\nimport numpy as np\n\ndata = [np.random.normal(0, std, 100) for std in range(1, 4)]\nplt.figure(figsize=(10, 6))\nplt.boxplot(data, vert=True, patch_artist=True)\nplt.title('Distribution of Test Scores by Group')\nplt.xticks([1, 2, 3], ['Group A', 'Group B', 'Group C'])\nplt.show()",
        caption: "Comparing variability across three different study groups."
      }
    }
  ],
  "Calculus & 3D": [
    {
      id: "calc-saddle",
      title: "MA.12: Saddle Points",
      engine: "python",
      config: {
        title: "f(x,y) = x² - y²",
        code: "import matplotlib.pyplot as plt\nimport numpy as np\nfrom mpl_toolkits.mplot3d import Axes3D\n\nx = np.linspace(-2, 2, 50)\ny = np.linspace(-2, 2, 50)\nX, Y = np.meshgrid(x, y)\nZ = X**2 - Y**2\n\nfig = plt.figure(figsize=(10, 8))\nax = fig.add_subplot(111, projection='3d')\nsurf = ax.plot_surface(X, Y, Z, cmap='viridis', edgecolors='white', lw=0.5)\nfig.colorbar(surf)\nax.set_title('Saddle Point at Origin')\nplt.show()",
        caption: "Visualization of a 3D surface with a critical point that is neither a max nor min."
      }
    }
  ]
};

export default function MathExplorer() {
  const [activeCategory, setActiveCategory] = useState("Algebra 1 & 2");
  const [activeScenario, setActiveScenario] = useState(TEST_SUITE["Algebra 1 & 2"][0]);
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // AI Sandbox state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiError, setAiError] = useState(null);

  const QUICK_PROMPTS = [
    "Draw y = sin(x) from -2π to 2π",
    "Plot a unit circle with angle π/3 marked",
    "Show the graph of y = x³ - 3x",
    "Render a 3D surface plot of f(x,y) = sin(x)*cos(y) using matplotlib",
    "Plot a normal distribution with mean 0 and std dev 1 using matplotlib",
    "Show the Pythagorean theorem with a 3-4-5 right triangle",
    "Graph y = e^x and y = ln(x) and show they are reflections",
    "Use matplotlib to plot a histogram of 1000 random samples",
    "Draw vectors for force addition: F1=(3,0) and F2=(0,4)",
    "Plot the parabola y = -x² + 4x - 3 and find its vertex",
  ];

  const runSimulation = async () => {
    if (activeScenario.engine !== 'python') return;
    setIsSimulating(true);
    setSimResult(null);
    try {
      const resp = await fetch('/api/python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activeScenario.config.code })
      });
      const data = await resp.json();
      if (data.chartData) {
        setSimResult(data.chartData);
      } else {
        alert("Execution Error: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Simulation Failed: " + e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const runAiPrompt = async (promptText) => {
    const prompt = promptText || aiPrompt;
    if (!prompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    const newMsg = { role: 'user', content: prompt };
    const updatedMessages = [...aiMessages, newMsg];
    setAiMessages(updatedMessages);
    setAiPrompt('');
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId: 'math-lab-test',
          subject: 'Math',
          course: 'Algebra 1',
          userFacts: { areaOfFocus: 'Visual Math Exploration' },
        })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      // The API uses pipeUIMessageStreamToResponse → SSE with data: prefix
      // Each line: "data: {type, ...}"
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let toolResults = [];
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete last line
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'text-delta') {
              assistantContent += event.delta || '';
              // Live update: show streaming text as it arrives
              setAiMessages(prev => {
                const next = [...prev];
                const lastIdx = next.length - 1;
                // Replace temp streaming entry or add one
                if (next[lastIdx]?._streaming) {
                  next[lastIdx] = { role: 'assistant', content: assistantContent, toolResults: [], _streaming: true };
                } else {
                  next.push({ role: 'assistant', content: assistantContent, toolResults: [], _streaming: true });
                }
                return next;
              });
            } else if (event.type === 'tool-output-available') {
              if (event.output) toolResults.push(event.output);
            }
          } catch {}
        }
      }
      // Replace streaming placeholder with final message (includes tool results)
      const assistantMsg = {
        role: 'assistant',
        content: assistantContent,
        toolResults,
      };
      setAiMessages(prev => {
        const next = [...prev];
        if (next[next.length - 1]?._streaming) {
          next[next.length - 1] = assistantMsg;
        } else {
          next.push(assistantMsg);
        }
        return next;
      });
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    setSimResult(null);
  }, [activeScenario]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Premium Header */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-xl">∑</span>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">SOL MATH LAB</h1>
              <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Rendering Engine • v2.0 (Mafs)</p>
            </div>
          </div>
          
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {Object.keys(TEST_SUITE).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveScenario(TEST_SUITE[cat][0]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-500' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Scenarios List */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Scenarios</h3>
          <div className="space-y-1">
            {TEST_SUITE[activeCategory].map(s => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s)}
                className={`w-full text-left px-5 py-4 rounded-2xl transition-all border ${
                  activeScenario.id === s.id
                    ? 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-black text-xs mb-1 uppercase tracking-tight">{s.id.split('-')[1]}</div>
                <div className="font-bold text-sm leading-tight">{s.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Canvas */}
        <div className="lg:col-span-9">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10"></div>
            
            <div className="mb-10 flex items-start justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[0.6rem] font-black uppercase tracking-widest mb-4">
                  Scenario Preview
                </span>
                <h2 className="text-4xl font-black tracking-tight mb-2">{activeScenario.title}</h2>
                <p className="text-slate-500 max-w-xl">{activeScenario.config.title}</p>
              </div>

              {activeScenario.engine === 'python' && (
                <button 
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                    isSimulating 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-amber-400 text-white hover:bg-amber-500 shadow-amber-400/20'
                  }`}
                >
                  {isSimulating ? 'Executing...' : 'Run Live Simulation'}
                </button>
              )}
            </div>

            <div className="math-stage rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5">
              {activeScenario.engine === "python" ? (
                <PythonVisual
                  key={activeScenario.id}
                  title={activeScenario.config.title}
                  code={activeScenario.config.code}
                  caption={activeScenario.config.caption}
                  chartData={simResult} 
                />
              ) : (
                <MathVisual 
                  key={activeScenario.id}
                  title={activeScenario.config.title}
                  layers={activeScenario.config.layers}
                  viewBox={activeScenario.config.viewBox}
                  labels={activeScenario.config.labels}
                  gridType={activeScenario.config.gridType}
                />
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Intent Rationale</h4>
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    This scenario validates the engine's ability to handle {activeScenario.title}. 
                    It specifically checks for coordinate precision, color-layering, and proper axis labeling strategies 
                    essential for Virginia SOL standards.
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Payload Spec</h4>
                  <pre className="p-6 rounded-3xl bg-black text-[0.65rem] font-mono text-blue-400/80 overflow-x-auto border border-white/5 h-[150px]">
                    {JSON.stringify(activeScenario.config, null, 2)}
                  </pre>
               </div>
            </div>
          </div>
        </div>

        {/* AI PROMPT SANDBOX */}
        <div className="mt-16 border-t border-slate-200 dark:border-white/5 pt-16">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-[0.6rem] font-black uppercase tracking-widest mb-4">
              AI Engine Test
            </span>
            <h2 className="text-3xl font-black tracking-tight">AI Prompt Sandbox</h2>
            <p className="text-slate-500 mt-2 text-sm">Type any math/science prompt — watch the AI choose between Mafs &amp; Matplotlib</p>
          </div>

          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => runAiPrompt(p)}
                className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-violet-500/10 hover:text-violet-500 transition-all border border-transparent hover:border-violet-500/20"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runAiPrompt()}
                placeholder="e.g. Draw a sine wave with amplitude 3..."
                className="flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
              />
              <button
                onClick={() => runAiPrompt()}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-violet-500/20"
              >
                {aiLoading ? 'Thinking...' : 'Run →'}
              </button>
            </div>

            {/* Error */}
            {aiError && (
              <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/30 rounded-2xl text-sm text-rose-600">
                ⚠️ {aiError}
              </div>
            )}

            {/* Message Thread */}
            <div className="space-y-6">
              {aiMessages.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' && (
                    <div className="flex justify-end">
                      <div className="bg-violet-500 text-white px-6 py-3 rounded-2xl rounded-br-sm text-sm font-medium max-w-xl">
                        {msg.content}
                      </div>
                    </div>
                  )}
                  {msg.role === 'assistant' && (
                    <div className="space-y-4">
                      {msg.content && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 px-6 py-4 rounded-2xl rounded-bl-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                          {msg.content}
                        </div>
                      )}
                      {msg.toolResults && msg.toolResults.map((tr, j) => (
                        <div key={j} className="rounded-2xl overflow-hidden border border-violet-500/10">
                          {tr.chartData && (
                            <PythonVisual chartData={tr.chartData} title={tr.title} caption={tr.caption} />
                          )}
                          {tr.layers && (
                            <MathVisual layers={tr.layers} viewBox={tr.viewBox} title={tr.title} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-2 items-center text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay:'0ms'}} />
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay:'150ms'}} />
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay:'300ms'}} />
                  <span className="text-xs font-bold uppercase tracking-widest ml-2">AI is reasoning...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
