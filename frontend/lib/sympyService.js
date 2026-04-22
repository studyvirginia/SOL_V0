import { spawn } from 'child_process';
import path from 'path';

/**
 * Validates if a student's mathematical input is structurally or mathematically 
 * equivalent to the correct answer using python's SymPy library.
 * 
 * @param {string} studentInput 
 * @param {string} correctAnswer 
 * @returns {Promise<{equivalent: boolean, method: string, error?: string}>}
 */
export async function evaluateMathEquivalence(studentInput, correctAnswer) {
  if (!studentInput || !correctAnswer) {
    return { equivalent: false, error: 'Missing inputs' };
  }

  const scriptPath = path.resolve(process.cwd(), 'lib/sympy_eval.py');

  return new Promise((resolve) => {
    // Utilize the python3 binary assuming the environment is active or global SymPy exists.
    const pythonProc = spawn('python3', [scriptPath]);
    
    let stdoutData = '';
    let stderrData = '';

    pythonProc.stdout.on('data', (data) => { stdoutData += data.toString(); });
    pythonProc.stderr.on('data', (data) => { stderrData += data.toString(); });

    pythonProc.on('close', (code) => {
      if (code !== 0) {
        console.error("[SymPy Validator Error]:", stderrData);
        return resolve({ equivalent: false, error: 'Execution failed', details: stderrData });
      }
      
      try {
        const result = JSON.parse(stdoutData.trim());
        resolve(result); // { equivalent: true/false, method: 'simplification' | 'structural' }
      } catch (err) {
        resolve({ equivalent: false, error: 'Parse failed', details: stdoutData });
      }
    });

    pythonProc.stdin.write(JSON.stringify({ student_input: studentInput, correct_answer: correctAnswer }));
    pythonProc.stdin.end();
  });
}

/**
 * Validates a generated Math MCQ for internal consistency.
 * 
 * @param {object} mcqData 
 * @returns {Promise<object>}
 */
export async function validateMcqLogic(mcqData) {
  const scriptPath = path.resolve(process.cwd(), 'scripts/math_validator.py');

  return new Promise((resolve) => {
    const pythonProc = spawn('python3', [scriptPath]);
    
    let stdoutData = '';
    let stderrData = '';

    pythonProc.stdout.on('data', (data) => { stdoutData += data.toString(); });
    pythonProc.stderr.on('data', (data) => { stderrData += data.toString(); });

    pythonProc.on('close', (code) => {
      if (code !== 0) {
        return resolve({ is_valid: false, errors: ['Execution failed: ' + stderrData] });
      }
      try {
        const result = JSON.parse(stdoutData.trim());
        resolve(result);
      } catch (err) {
        resolve({ is_valid: false, errors: ['Parse failed: ' + stdoutData] });
      }
    });

    pythonProc.stdin.write(JSON.stringify(mcqData));
    pythonProc.stdin.end();
  });
}
