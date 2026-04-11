"""
matplotlib_gen.py — Safe matplotlib code executor for SOL engine tests.

Reads a JSON spec from stdin:
  { "code": "...matplotlib python code...", "dpi": 150 }

The code block MUST:
  - Use `fig, ax = plt.subplots(...)` or `fig = plt.figure(...)`
  - Not call plt.show() — output is captured to a PNG buffer

Writes to stdout: base64-encoded PNG string (no newlines)
Writes errors to stderr.
"""

import sys
import json
import base64
import io
import traceback
import math

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import numpy as np

def main():
    try:
        raw = sys.stdin.read()
        spec = json.loads(raw)
    except Exception as e:
        sys.stderr.write(f"JSON parse error: {e}\n")
        sys.exit(1)

    code = spec.get("code", "").strip()
    dpi = int(spec.get("dpi", 150))

    if not code:
        sys.stderr.write("No code provided\n")
        sys.exit(1)

    # Restricted but useful namespace — no file I/O, no subprocess, no os
    safe_globals = {
        "__builtins__": {
            "abs": abs, "round": round, "range": range, "len": len,
            "list": list, "dict": dict, "tuple": tuple, "set": set,
            "zip": zip, "enumerate": enumerate, "map": map, "filter": filter,
            "min": min, "max": max, "sum": sum, "sorted": sorted,
            "print": print, "str": str, "int": int, "float": float,
            "bool": bool, "isinstance": isinstance, "type": type,
            "ValueError": ValueError, "TypeError": TypeError,
        },
        "plt": plt,
        "np": np,
        "math": math,
        "mpatches": mpatches,
        "mlines": mlines,
    }

    # Strip import lines — np, plt, math, mpatches, mlines are pre-injected.
    # The LLM often generates `import numpy as np` at the top despite instructions.
    stripped = "\n".join(
        line for line in code.splitlines()
        if not line.strip().startswith(("import ", "from "))
    )

    try:
        exec(stripped, safe_globals)
    except Exception as e:
        sys.stderr.write(f"Exec error: {e}\n{traceback.format_exc()}\n")
        sys.exit(2)

    # Capture current figure
    fig = plt.gcf()
    if fig is None:
        sys.stderr.write("No figure was created\n")
        sys.exit(3)

    buf = io.BytesIO()
    try:
        fig.savefig(
            buf,
            format="png",
            dpi=dpi,
            bbox_inches="tight",
            facecolor=fig.get_facecolor(),
            edgecolor="none",
        )
    except Exception as e:
        sys.stderr.write(f"Save error: {e}\n")
        sys.exit(4)
    finally:
        plt.close("all")

    buf.seek(0)
    sys.stdout.write(base64.b64encode(buf.read()).decode("utf-8"))


if __name__ == "__main__":
    main()
