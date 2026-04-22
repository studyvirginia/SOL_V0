"""
matplotlib_gen.py — Template-first graph executor for SOL V0.

Priority:
  1. Try graph_templates.py (pre-built, gallery-quality, guaranteed style)
  2. If template fails or type is unknown → fall back to LLM-generated code
     (caller, matplotlib-generate.js, handles the LLM call and passes code here)

Reads from stdin (JSON):
  {
    "mode": "template" | "code",
    "format": "png" | "svg",           # NEW: Support for crisp vectors
    "spec": { ...graph spec... },       # for template mode
    "code": "...python code...",         # for code mode (LLM fallback)
    "dpi": 150
  }

Writes to stdout: base64-encoded PNG string OR raw SVG XML
Writes errors to stderr.
"""

import sys
import json
import base64
import io
import traceback
import math
import os

# Inject local user site-packages immediately for Node.js spawn environments
import site
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.append(user_site)
sys.path.append("/Users/lmarin/Library/Python/3.9/lib/python/site-packages")

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import numpy as np

# ─── NumPy Validation ─────────────────────────────────────────────────────────

def validate_spec(spec):
    graph_type = spec.get("type", "function")
    equations = spec.get("equations", [])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])

    for i, pt in enumerate(label_points):
        x, y = pt.get("x"), pt.get("y")
        if x is None or y is None:
            return False, f"label_points[{i}] missing x or y"
        try:
            xf, yf = float(x), float(y)
            if not np.isfinite(xf) or not np.isfinite(yf):
                return False, f"label_points[{i}] contains non-finite value"
        except (TypeError, ValueError):
            return False, f"label_points[{i}] x/y must be numeric"

    for i, pt in enumerate(find):
        x, y = pt.get("x"), pt.get("y")
        if x is None and y is None:
            return False, f"find[{i}] missing x and y"
        try:
            if x is not None:
                xf = float(x)
                if not np.isfinite(xf):
                    return False, f"find[{i}].x is non-finite"
        except (TypeError, ValueError):
            return False, f"find[{i}].x must be numeric"

    for i, eq in enumerate(equations):
        if not isinstance(eq, str) or not eq.strip():
            return False, f"equations[{i}] is empty or not a string"

    return True, None

# ─── SVG Theme Awareness ──────────────────────────────────────────────────────

def process_svg_theme(svg_text):
    """
    Injects CSS-driven theme awareness into raw Matplotlib SVG.
    Enables automatic axis color shifting based on frontend .dark class.
    """
    # 1. Map standard black elements to currentColor for theme responsiveness
    svg_text = svg_text.replace('stroke="#000000"', 'stroke="currentColor" class="plt-stroke"')
    svg_text = svg_text.replace('fill="#000000"', 'fill="currentColor" class="plt-fill"')
    
    # 2. Inject smooth transition style block
    style_block = """
    <style>
      .plt-stroke { transition: stroke 0.3s ease; }
      .plt-fill { transition: fill 0.3s ease; }
    </style>
    """
    if "</defs>" in svg_text:
        svg_text = svg_text.replace("</defs>", f"{style_block}</defs>")
    else:
        svg_text = svg_text.replace("<svg ", f"<svg>{style_block}", 1)
        
    return svg_text

# ─── Template Mode ─────────────────────────────────────────────────────────────

def run_template(spec, dpi):
    import graph_templates
    fig = graph_templates.render(spec)
    
    for ax in fig.get_axes():
        for text_obj in ax.texts:
            text_obj.set_bbox(dict(facecolor='white', edgecolor='none', alpha=0.9, boxstyle='round,pad=0.2'))
    fig.tight_layout()

    buf = io.BytesIO()
    save_format = spec.get("format", "png")
    fig.savefig(buf, format=save_format, dpi=dpi, bbox_inches="tight",
                facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close("all")
    buf.seek(0)
    
    if save_format == "svg":
        return process_svg_theme(buf.read().decode("utf-8"))
    return base64.b64encode(buf.read()).decode("utf-8")

# ─── Code Mode (LLM Fallback) ──────────────────────────────────────────────────

def run_code(code, dpi, save_format="png"):
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
        "plt": plt, "np": np, "math": math, "mpatches": mpatches, "mlines": mlines,
    }

    stripped = "\n".join(
        line for line in code.splitlines()
        if not line.strip().startswith(("import ", "from "))
    )
    exec(stripped, safe_globals)

    fig = plt.gcf()
    if fig is None:
        raise RuntimeError("No figure was created")

    for ax in fig.get_axes():
        for text_obj in ax.texts:
            if text_obj.get_bbox_patch() is None:
                text_obj.set_bbox(dict(facecolor='white', edgecolor='none', alpha=0.9, boxstyle='round,pad=0.2'))
    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format=save_format, dpi=dpi, bbox_inches="tight",
                facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close("all")
    buf.seek(0)

    if save_format == "svg":
        return process_svg_theme(buf.read().decode("utf-8"))
    return base64.b64encode(buf.read()).decode("utf-8")

# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)
    except Exception as e:
        sys.stderr.write(f"JSON parse error: {e}\n")
        sys.exit(1)

    mode = payload.get("mode", "code")
    dpi = int(payload.get("dpi", 150))
    save_format = payload.get("format", "png")

    if mode == "template":
        spec = payload.get("spec", {})
        spec["format"] = save_format
        valid, err = validate_spec(spec)
        if not valid:
            sys.stderr.write(f"Validation error: {err}\n")
            sys.exit(2)
        try:
            result = run_template(spec, dpi)
            sys.stdout.write(result)
        except Exception as e:
            sys.stderr.write(f"TEMPLATE_FAILED: {e}\n{traceback.format_exc()}\n")
            sys.exit(3)

    elif mode == "code":
        code = payload.get("code", "").strip()
        if not code:
            sys.stderr.write("No code provided\n")
            sys.exit(1)
        try:
            result = run_code(code, dpi, save_format)
            sys.stdout.write(result)
        except Exception as e:
            sys.stderr.write(f"Exec error: {e}\n{traceback.format_exc()}\n")
            sys.exit(2)
    else:
        sys.stderr.write(f"Unknown mode: {mode}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
