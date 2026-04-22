import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { student_input, correct_answer } = req.body;

  if (!student_input || !correct_answer) {
    return res.status(400).json({ error: 'Missing student_input or correct_answer' });
  }

  const scriptPath = path.resolve(process.cwd(), 'lib/sympy_eval.py');

  return new Promise((resolve) => {
    // Spawn python directly assuming the venv exists from matplotlib routines
    const pythonProc = spawn('python3', [scriptPath]);
    
    let stdoutData = '';
    let stderrData = '';

    pythonProc.stdout.on('data', (data) => { stdoutData += data.toString(); });
    pythonProc.stderr.on('data', (data) => { stderrData += data.toString(); });

    pythonProc.on('close', (code) => {
      if (code !== 0) {
        console.error("SymPy Eval Error:", stderrData);
        res.status(500).json({ error: 'Python execution failed', details: stderrData });
        return resolve();
      }
      
      try {
        const result = JSON.parse(stdoutData.trim());
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse SymPy output', output: stdoutData });
      }
      resolve();
    });

    // Send payload
    pythonProc.stdin.write(JSON.stringify({ student_input, correct_answer }));
    pythonProc.stdin.end();
  });
}
