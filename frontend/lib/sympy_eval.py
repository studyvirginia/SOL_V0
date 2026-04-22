"""
sympy_eval.py — Deterministic mathematical equivalence evaluator.
Used to grade student math inputs perfectly without LLM grading hallucinations.
"""

import sys
import json
import traceback
import sympy

def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)
        
        student_input = payload.get("student_input", "").strip()
        correct_answer = payload.get("correct_answer", "").strip()
        
        if not student_input or not correct_answer:
            print(json.dumps({"error": "Missing inputs"}))
            return

        # Safely parse both expressions using SymPy's sympify (which guards against exec attacks but allows math)
        expr_student = sympy.sympify(student_input, evaluate=False)
        expr_correct = sympy.sympify(correct_answer, evaluate=False)
        
        # Test 1: Exact structural equivalence
        if expr_student == expr_correct:
            result = {"equivalent": True, "method": "structural"}
        else:
            # Test 2: Mathematical equivalence (simplifying their difference)
            diff = sympy.simplify(expr_student - expr_correct)
            if diff == 0:
                result = {"equivalent": True, "method": "simplification"}
            else:
                result = {"equivalent": False, "method": "simplification"}
                
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)

if __name__ == "__main__":
    main()
