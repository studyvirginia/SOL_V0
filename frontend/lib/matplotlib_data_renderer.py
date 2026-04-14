import sys
import json
import base64
import io
import traceback
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# Educational Color Palette
COLORS = {
    "primary": "#2563eb",  # Blue
    "secondary": "#16a34a", # Green
    "tertiary": "#d97706",  # Orange
    "accent": "#e11d48",    # Red
    "background": "#ffffff",
    "canvas": "#fafafa",
    "grid": "#cccccc",
    "text": "#1e293b"
}

def render_diagram(spec):
    fig, ax = plt.subplots(figsize=(8, 6))
    
    # Global Config
    viewport = spec.get("viewport", {})
    x_range = viewport.get("xRange", [-10, 10])
    y_range = viewport.get("yRange", [-10, 10])
    show_grid = viewport.get("showGrid", True)
    is_cartesian = viewport.get("isCartesian", True)

    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    
    if is_cartesian:
        ax.spines['left'].set_position('zero')
        ax.spines['bottom'].set_position('zero')
        ax.spines['right'].set_color('none')
        ax.spines['top'].set_color('none')
        ax.xaxis.set_ticks_position('bottom')
        ax.yaxis.set_ticks_position('left')
    
    if show_grid:
        ax.grid(True, alpha=0.3, linestyle='--', color=COLORS["grid"])

    # Elements
    for el in spec.get("elements", []):
        etype = el.get("type")
        color = COLORS.get(el.get("color"), COLORS["primary"])
        
        if etype == "function":
            expr = el.get("expression")
            # Create x values, handling numpy context
            x = np.linspace(x_range[0], x_range[1], el.get("samples", 200))
            try:
                # Safe eval with numpy
                y = eval(expr, {"np": np, "x": x})
                ax.plot(x, y, color=color, label=el.get("label"), linestyle=el.get("style", "solid"), lw=2)
            except Exception as e:
                print(f"Error plotting function {expr}: {e}", file=sys.stderr)

        elif etype == "shape":
            kind = el.get("kind")
            points = el.get("points", [])
            fill = el.get("fill", False)
            
            if kind == "circle" and points:
                # points[0] is center, need radius (usually in params or just use first point?)
                # For schema consistency, let's assume points[0] = center, points[1][0] = radius
                center = points[0]
                radius = 1 # default
                if len(points) > 1: radius = np.linalg.norm(np.array(points[0]) - np.array(points[1]))
                
                circle = mpatches.Circle(center, radius, color=color, fill=fill, alpha=0.3 if fill else 1, lw=2)
                ax.add_patch(circle)
            
            elif kind == "polygon" and points:
                poly = mpatches.Polygon(points, color=color, fill=fill, alpha=0.3 if fill else 1, lw=2)
                ax.add_patch(poly)
            
            elif kind == "rectangle" and len(points) >= 2:
                # points[0] = bottom-left, points[1] = top-right
                width = points[1][0] - points[0][0]
                height = points[1][1] - points[0][1]
                rect = mpatches.Rectangle(points[0], width, height, color=color, fill=fill, alpha=0.3 if fill else 1, lw=2)
                ax.add_patch(rect)

        elif etype == "vector":
            origin = el.get("origin")
            direction = el.get("direction")
            ax.annotate("", xy=direction, xytext=origin,
                        arrowprops=dict(arrowstyle="->", color=color, lw=2, mutation_scale=20))
            if el.get("label"):
                mid = (np.array(origin) + np.array(direction)) / 2
                ax.text(mid[0], mid[1], el.get("label"), color=color, fontweight='bold', ha='center')

        elif etype == "annotation":
            variant = el.get("variant", "label")
            if variant == "title":
                ax.text(el.get("x"), el.get("y"), el.get("text"), fontsize=12, fontweight='bold', ha='center')
            else:
                ax.text(el.get("x"), el.get("y"), el.get("text"), fontsize=10)

        elif etype == "marker":
            kind = el.get("kind")
            if kind == "hollow_circle":
                ax.plot(el.get("x"), el.get("y"), 'o', mfc='white', mec=COLORS["accent"], ms=10, zorder=10)

    # Title
    if spec.get("title"):
        plt.title(spec.get("title"), fontsize=14, fontweight='bold', pad=20, color=COLORS["text"])
    
    # Save to buffer
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor=COLORS["background"])
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input: return
        spec = json.loads(raw_input)
        result = render_diagram(spec)
        sys.stdout.write(result)
    except Exception as e:
        sys.stderr.write(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main()
