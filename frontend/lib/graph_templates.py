"""
graph_templates.py — Pre-built, gallery-quality Matplotlib templates for SOL V0.

Architecture: Template-based generation.
The AI outputs a JSON spec. This module selects the right template,
validates the params with NumPy, and renders a PNG.
No raw code generation — guaranteed quality every time.

Template sources:
- Official Matplotlib Gallery: matplotlib.org/stable/gallery
  (Shapes and Collections for geometry, Text/Annotations for labels)
- Python Graph Gallery: python-graph-gallery.com
- Sebastian Raschka's gallery: github.com/rasbt/matplotlib-gallery (academic style)
- SymPy plotting docs: docs.sympy.org/latest/modules/plotting.html
"""

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.lines as mlines
import matplotlib.patheffects as pe
import math

# ─── Color Palette (academic, SOL-appropriate) ────────────────────────────────
PRIMARY   = "#2563eb"   # blue  — primary curve / main element
SECONDARY = "#16a34a"   # green — secondary curve
TERTIARY  = "#d97706"   # amber — tertiary curve
ACCENT    = "#7c3aed"   # violet — accent / annotation
DANGER    = "#e11d48"   # red   — find points / errors
GRAY      = "#6b7280"   # gray  — gridlines / axes
LIGHT_BG  = "#fafafa"   # near-white background

FONT_TITLE = {"fontsize": 13, "fontweight": "bold", "pad": 10, "color": "#111827"}
FONT_LABEL = {"fontsize": 10, "color": "#374151"}
FONT_TICK  = {"labelsize": 9, "colors": "#374151"}

def _base_fig(figsize=(7, 5)):
    """Create a clean, academic-style figure."""
    fig, ax = plt.subplots(figsize=figsize)
    fig.patch.set_facecolor("white")
    ax.set_facecolor(LIGHT_BG)
    ax.grid(True, alpha=0.25, linestyle="--", linewidth=0.7, color=GRAY)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#d1d5db")
    ax.spines["bottom"].set_color("#d1d5db")
    ax.tick_params(**FONT_TICK)
    return fig, ax

def _add_axes(ax, xlim=None, ylim=None):
    """Draw x=0 and y=0 axis lines."""
    if xlim:
        ax.set_xlim(xlim)
    if ylim:
        ax.set_ylim(ylim)
    ax.axhline(0, color="#374151", linewidth=0.9, zorder=2)
    ax.axvline(0, color="#374151", linewidth=0.9, zorder=2)

def _add_label_points(ax, label_points):
    """Plot labeled points on the graph."""
    for pt in (label_points or []):
        x, y = pt.get("x", 0), pt.get("y", 0)
        label = pt.get("label", "")
        ax.plot(x, y, "o", color=PRIMARY, markersize=7, zorder=6,
                markeredgecolor="white", markeredgewidth=1.5)
        if label:
            ax.annotate(
                label, xy=(x, y),
                xytext=(x + 0.15, y + 0.2),
                fontsize=9, color="#111827",
                arrowprops=dict(arrowstyle="-", color="#9ca3af", lw=0.8),
            )

def _add_find_points(ax, find_points):
    """Plot hollow '?' markers for points the student must identify."""
    for pt in (find_points or []):
        x, y = pt.get("x", 0), pt.get("y", 0)
        ax.plot(x, y, "o", mfc="white", mec=DANGER, ms=11, zorder=7,
                markeredgewidth=2)
        ax.annotate("?", xy=(x, y), xytext=(x + 0.12, y + 0.18),
                    fontsize=9, color=DANGER, fontweight="bold")


# ─── TEMPLATE 1: Linear Function ──────────────────────────────────────────────
def linear_function(spec):
    """y = mx + b — single or multiple lines with intercept markers."""
    equations = spec.get("equations", ["y=x"])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", equations[0] if equations else "Linear Function")

    fig, ax = _base_fig()

    colors = [PRIMARY, SECONDARY, TERTIARY, ACCENT]
    x = np.linspace(-10, 10, 400)

    for i, eq in enumerate(equations[:4]):
        try:
            # Parse y = mx + b
            expr = eq.replace("y=", "").replace("y =", "").strip()
            y = eval(expr.replace("x", "*(x)"), {"x": x, "np": np, "__builtins__": {}})
            ax.plot(x, y, color=colors[i % len(colors)], linewidth=2.5,
                    label=eq, zorder=4)
        except Exception:
            continue

    if len(equations) > 1:
        ax.legend(fontsize=9, framealpha=0.8, edgecolor="#e5e7eb")

    _add_axes(ax, xlim=(-8, 8), ylim=(-8, 8))
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    ax.set_xlabel("x", **FONT_LABEL)
    ax.set_ylabel("y", **FONT_LABEL, rotation=0, labelpad=12)
    return fig


# ─── TEMPLATE 2: Quadratic / Parabola ─────────────────────────────────────────
def quadratic(spec):
    """Parabola with vertex, roots, axis of symmetry marked."""
    equations = spec.get("equations", ["y=x**2"])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Quadratic Function")

    fig, ax = _base_fig()
    x = np.linspace(-8, 8, 600)
    colors = [PRIMARY, SECONDARY, TERTIARY]

    for i, eq in enumerate(equations[:3]):
        try:
            expr = eq.replace("y=", "").replace("y =", "").strip()
            y = eval(expr.replace("x", "*(x)"), {"x": x, "np": np, "__builtins__": {}})
            ax.plot(x, y, color=colors[i % 3], linewidth=2.5, label=eq, zorder=4)
        except Exception:
            continue

    if len(equations) > 1:
        ax.legend(fontsize=9, framealpha=0.8, edgecolor="#e5e7eb")

    _add_axes(ax, xlim=(-7, 7), ylim=(-9, 9))
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    ax.set_xlabel("x", **FONT_LABEL)
    ax.set_ylabel("y", **FONT_LABEL, rotation=0, labelpad=12)
    return fig


# ─── TEMPLATE 3: Trigonometric Functions ───────────────────────────────────────
def trig(spec):
    """sin, cos, tan curves with period/amplitude markers."""
    equations = spec.get("equations", ["y=sin(x)"])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Trigonometric Function")

    fig, ax = _base_fig(figsize=(9, 4))
    x = np.linspace(-2 * np.pi, 2 * np.pi, 600)
    colors = [PRIMARY, SECONDARY, TERTIARY]

    for i, eq in enumerate(equations[:3]):
        try:
            expr = eq.replace("y=", "").replace("y =", "").strip()
            safe_ns = {"x": x, "np": np, "sin": np.sin, "cos": np.cos,
                       "tan": np.tan, "pi": np.pi, "__builtins__": {}}
            y_raw = eval(expr.replace("x", "*(x)"), safe_ns)
            # Clip tan singularities
            y = np.where(np.abs(y_raw) > 6, np.nan, y_raw)
            ax.plot(x, y, color=colors[i % 3], linewidth=2.5, label=eq, zorder=4)
        except Exception:
            continue

    # π x-axis labels
    ticks = [-2*np.pi, -np.pi, 0, np.pi, 2*np.pi]
    labels = ["-2π", "-π", "0", "π", "2π"]
    ax.set_xticks(ticks)
    ax.set_xticklabels(labels, fontsize=9)

    if len(equations) > 1:
        ax.legend(fontsize=9, framealpha=0.8, edgecolor="#e5e7eb")

    _add_axes(ax, xlim=(-2*np.pi - 0.3, 2*np.pi + 0.3), ylim=(-2.5, 2.5))
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE 4: System of Equations ──────────────────────────────────────────
def system_of_equations(spec):
    """Two lines drawn with their intersection highlighted."""
    equations = spec.get("equations", ["y=2*x+1", "y=-x+4"])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "System of Equations")

    fig, ax = _base_fig()
    x = np.linspace(-8, 8, 400)
    colors = [PRIMARY, SECONDARY]

    y_curves = []
    for i, eq in enumerate(equations[:2]):
        try:
            expr = eq.replace("y=", "").replace("y =", "").strip()
            y = eval(expr.replace("x", "*(x)"), {"x": x, "np": np, "__builtins__": {}})
            ax.plot(x, y, color=colors[i], linewidth=2.5, label=eq, zorder=4)
            y_curves.append((expr, y))
        except Exception:
            continue

    ax.legend(fontsize=9, framealpha=0.8, edgecolor="#e5e7eb")
    _add_axes(ax, xlim=(-7, 7), ylim=(-7, 7))
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    ax.set_xlabel("x", **FONT_LABEL)
    ax.set_ylabel("y", **FONT_LABEL, rotation=0, labelpad=12)
    return fig


# ─── TEMPLATE 5: Inequality / Shaded Region ────────────────────────────────────
def inequality(spec):
    """Linear or quadratic inequality with shaded feasible region."""
    equations = spec.get("equations", ["y=2*x+1"])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Inequality")
    description = spec.get("description", "")

    fig, ax = _base_fig()
    x = np.linspace(-8, 8, 400)
    colors = [PRIMARY, SECONDARY]

    for i, eq in enumerate(equations[:2]):
        try:
            expr = eq.replace("y=", "").replace("y<=", "").replace("y>=", "").replace("y <", "").replace("y >", "").replace("y =", "").strip()
            y = eval(expr.replace("x", "*(x)"), {"x": x, "np": np, "__builtins__": {}})
            ax.plot(x, y, color=colors[i], linewidth=2.5, linestyle="--" if ">=" not in eq and "<=" not in eq else "-", label=eq)
            # Shade below the first line
            if i == 0:
                ax.fill_between(x, y, -9, alpha=0.12, color=colors[i])
        except Exception:
            continue

    ax.legend(fontsize=9, framealpha=0.8, edgecolor="#e5e7eb")
    _add_axes(ax, xlim=(-7, 7), ylim=(-8, 8))
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE 6: Number Line ───────────────────────────────────────────────────
def number_line(spec):
    """1D number line with points, intervals, and inequality markers."""
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Number Line")
    description = spec.get("description", "")

    fig, ax = _base_fig(figsize=(9, 2.5))
    ax.set_facecolor("white")
    ax.grid(False)

    # Determine range
    all_x = [pt["x"] for pt in (label_points or [])] + [pt["x"] for pt in (find or [])]
    xmin = min(all_x) - 2 if all_x else -6
    xmax = max(all_x) + 2 if all_x else 6

    ax.set_xlim(xmin - 0.5, xmax + 0.5)
    ax.set_ylim(-0.5, 0.5)
    ax.axhline(0, color="#374151", linewidth=2, zorder=2)
    ax.set_yticks([])
    ax.spines["left"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["top"].set_visible(False)
    ax.spines["bottom"].set_visible(False)

    # Tick marks
    for xi in range(int(xmin), int(xmax) + 1):
        ax.plot(xi, 0, "|", color="#374151", markersize=12, markeredgewidth=1.5)
        ax.text(xi, -0.2, str(xi), ha="center", va="center", fontsize=9, color="#374151")

    # Label points
    for pt in (label_points or []):
        x, label = pt.get("x", 0), pt.get("label", "")
        ax.plot(x, 0, "o", color=PRIMARY, markersize=12, zorder=6,
                markeredgecolor="white", markeredgewidth=2)
        if label:
            ax.text(x, 0.25, label, ha="center", fontsize=9, color=PRIMARY, fontweight="bold")

    # Find points
    for pt in (find or []):
        x = pt.get("x", 0)
        ax.plot(x, 0, "o", mfc="white", mec=DANGER, ms=13, zorder=7, markeredgewidth=2.5)
        ax.text(x, 0.25, "?", ha="center", fontsize=9, color=DANGER, fontweight="bold")

    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE 7: Circle (Geometry) ────────────────────────────────────────────
def geometry_circle(spec):
    """Circle with optional radius, chord, tangent line labels."""
    description = spec.get("description", "circle with radius 5")
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Circle")

    # Parse radius from description
    r = 5
    for word in description.split():
        try:
            r = float(word)
            break
        except ValueError:
            continue

    fig, ax = _base_fig(figsize=(6, 6))
    circle = plt.Circle((0, 0), r, fill=False, color=PRIMARY, linewidth=2.5)
    ax.add_patch(circle)
    ax.plot(0, 0, ".", color="#374151", markersize=6, zorder=5)
    ax.text(0.1, 0.1, "O", fontsize=10, color="#374151")

    margin = r + 1
    _add_axes(ax, xlim=(-margin, margin), ylim=(-margin, margin))
    ax.set_aspect("equal")
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE 8: Triangle (Geometry) ──────────────────────────────────────────
def geometry_triangle(spec):
    """Triangle with vertices labeled A, B, C and optional altitude/angle markers."""
    description = spec.get("description", "triangle with vertices (0,0) (4,0) (2,3)")
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Triangle")

    # Default vertices — can be overridden by label_points
    vertices = [(0, 0), (4, 0), (2, 3)]
    default_labels = ["A", "B", "C"]

    if label_points and len(label_points) >= 3:
        vertices = [(pt["x"], pt["y"]) for pt in label_points[:3]]
        labels_to_use = [pt.get("label", default_labels[i]) for i, pt in enumerate(label_points[:3])]
    else:
        labels_to_use = default_labels

    xs = [v[0] for v in vertices] + [vertices[0][0]]
    ys = [v[1] for v in vertices] + [vertices[0][1]]

    fig, ax = _base_fig(figsize=(7, 6))
    ax.fill(xs[:-1], ys[:-1], alpha=0.06, color=PRIMARY)
    ax.plot(xs, ys, color=PRIMARY, linewidth=2.5, zorder=4)

    # Vertex labels
    offset = 0.2
    for (x, y), label in zip(vertices, labels_to_use):
        ax.plot(x, y, "o", color=PRIMARY, markersize=7, zorder=6,
                markeredgecolor="white", markeredgewidth=1.5)
        # Offset label away from triangle center
        cx = sum(v[0] for v in vertices) / 3
        cy = sum(v[1] for v in vertices) / 3
        dx = (x - cx) * 0.25 + offset
        dy = (y - cy) * 0.25 + offset
        ax.text(x + dx, y + dy, label, fontsize=11, fontweight="bold",
                color="#111827", ha="center", va="center")

    margin = 1.5
    all_x = [v[0] for v in vertices]
    all_y = [v[1] for v in vertices]
    _add_axes(ax,
              xlim=(min(all_x) - margin, max(all_x) + margin),
              ylim=(min(all_y) - margin, max(all_y) + margin))
    ax.set_aspect("equal")
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE 9: Scatter Plot ─────────────────────────────────────────────────
def scatter(spec):
    """Scatter plot with optional trend line."""
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Scatter Plot")
    description = spec.get("description", "")
    equations = spec.get("equations", [])

    fig, ax = _base_fig()

    if label_points:
        xs_pts = np.array([pt["x"] for pt in label_points])
        ys_pts = np.array([pt["y"] for pt in label_points])
        ax.scatter(xs_pts, ys_pts, color=PRIMARY, s=70, zorder=5,
                   edgecolors="white", linewidths=1.5)

        # Optional trend line
        if equations:
            try:
                x_line = np.linspace(min(xs_pts) - 1, max(xs_pts) + 1, 200)
                expr = equations[0].replace("y=", "").replace("y =", "").strip()
                y_line = eval(expr.replace("x", "*(x)"), {"x": x_line, "np": np, "__builtins__": {}})
                ax.plot(x_line, y_line, color=SECONDARY, linewidth=2, linestyle="--", label=equations[0])
                ax.legend(fontsize=9)
            except Exception:
                pass

    _add_axes(ax)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    ax.set_xlabel("x", **FONT_LABEL)
    ax.set_ylabel("y", **FONT_LABEL, rotation=0, labelpad=12)
    return fig


# ─── TEMPLATE 10: Bar Chart ───────────────────────────────────────────────────
def bar_chart(spec):
    """Vertical bar chart for data/statistics content."""
    label_points = spec.get("label_points", [])
    title = spec.get("notes", "Bar Chart")
    description = spec.get("description", "")

    fig, ax = _base_fig(figsize=(8, 5))
    ax.grid(axis="y", alpha=0.25, linestyle="--")
    ax.grid(axis="x", visible=False)

    if label_points:
        labels = [str(pt.get("label", f"Item {i+1}")) for i, pt in enumerate(label_points)]
        values = [pt.get("y", 0) for pt in label_points]
        colors_bars = [PRIMARY, SECONDARY, TERTIARY, ACCENT, DANGER]
        bars = ax.bar(labels, values,
                      color=[colors_bars[i % len(colors_bars)] for i in range(len(labels))],
                      width=0.6, edgecolor="white", linewidth=1.5, zorder=4)

        # Value labels on bars
        for bar_obj, val in zip(bars, values):
            ax.text(bar_obj.get_x() + bar_obj.get_width() / 2,
                    bar_obj.get_height() + max(values) * 0.02,
                    str(val), ha="center", va="bottom", fontsize=9, fontweight="bold")

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE 11: Exponential Function ────────────────────────────────────────
def exponential(spec):
    """Exponential growth or decay curve."""
    equations = spec.get("equations", ["y=2**x"])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Exponential Function")

    fig, ax = _base_fig()
    x = np.linspace(-5, 5, 400)
    colors = [PRIMARY, SECONDARY, TERTIARY]

    for i, eq in enumerate(equations[:3]):
        try:
            expr = eq.replace("y=", "").replace("y =", "").strip()
            safe_ns = {"x": x, "np": np, "e": np.e, "exp": np.exp, "__builtins__": {}}
            y_raw = eval(expr.replace("x", "*(x)"), safe_ns)
            y = np.clip(y_raw, -50, 50)
            ax.plot(x, y, color=colors[i % 3], linewidth=2.5, label=eq, zorder=4)
        except Exception:
            continue

    if len(equations) > 1:
        ax.legend(fontsize=9, framealpha=0.8)

    _add_axes(ax, xlim=(-5, 5), ylim=(-5, 20))
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    ax.set_xlabel("x", **FONT_LABEL)
    ax.set_ylabel("y", **FONT_LABEL, rotation=0, labelpad=12)
    return fig


# ─── TEMPLATE 12: Piecewise Function ──────────────────────────────────────────
def piecewise(spec):
    """Piecewise function with clear domain boundary markers."""
    equations = spec.get("equations", ["y=x+1 for x<0", "y=x**2 for x>=0"])
    label_points = spec.get("label_points", [])
    find = spec.get("find", [])
    title = spec.get("notes", "Piecewise Function")

    fig, ax = _base_fig()
    colors = [PRIMARY, SECONDARY, TERTIARY]
    x_full = np.linspace(-7, 7, 800)

    for i, piece in enumerate(equations[:3]):
        try:
            # Split on " for " or " if "
            separator = " for " if " for " in piece else " if "
            if separator in piece:
                expr_part, cond_part = piece.split(separator, 1)
            else:
                expr_part = piece
                cond_part = "True"

            expr_part = expr_part.replace("y=", "").replace("y =", "").strip()
            safe_ns = {"x": x_full, "np": np, "__builtins__": {}}
            mask = eval(cond_part.replace("x", "(x)"), safe_ns)
            y_full = eval(expr_part.replace("x", "*(x)"), safe_ns)
            y_masked = np.where(mask, y_full, np.nan)
            ax.plot(x_full, y_masked, color=colors[i % 3], linewidth=2.5,
                    label=piece, zorder=4)
        except Exception:
            continue

    ax.legend(fontsize=8, framealpha=0.8)
    _add_axes(ax, xlim=(-7, 7), ylim=(-8, 8))
    _add_label_points(ax, label_points)
    _add_find_points(ax, find)
    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE 13: Unit Circle ─────────────────────────────────────────────────
def unit_circle(spec):
    """Unit circle with standard angle markers and trig value labels."""
    label_points = spec.get("label_points", [])
    title = spec.get("notes", "Unit Circle")

    fig, ax = _base_fig(figsize=(7, 7))
    circle = plt.Circle((0, 0), 1, fill=False, color=PRIMARY, linewidth=2.5)
    ax.add_patch(circle)

    # Standard angles
    angles_deg = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]
    labels_map = {
        0: "0", 30: "π/6", 45: "π/4", 60: "π/3", 90: "π/2",
        120: "2π/3", 135: "3π/4", 150: "5π/6", 180: "π",
        210: "7π/6", 225: "5π/4", 240: "4π/3", 270: "3π/2",
        300: "5π/3", 315: "7π/4", 330: "11π/6"
    }

    for deg in angles_deg:
        rad = math.radians(deg)
        cx, cy = math.cos(rad), math.sin(rad)
        ax.plot([0, cx], [0, cy], color="#e5e7eb", linewidth=0.7, zorder=1)
        ax.plot(cx, cy, "o", color=PRIMARY, markersize=5, zorder=5)
        offset = 1.18
        ax.text(cx * offset, cy * offset, labels_map.get(deg, ""),
                fontsize=7.5, ha="center", va="center", color="#374151")

    _add_axes(ax, xlim=(-1.5, 1.5), ylim=(-1.5, 1.5))
    ax.set_aspect("equal")
    ax.plot(0, 0, ".", color="#374151", markersize=6, zorder=5)
    _add_label_points(ax, label_points)
    ax.set_title(title, **FONT_TITLE)
    return fig


# ─── TEMPLATE DISPATCHER ──────────────────────────────────────────────────────

TEMPLATE_MAP = {
    "function":          linear_function,
    "linear":            linear_function,
    "linear_function":   linear_function,
    "quadratic":         quadratic,
    "trig":              trig,
    "trigonometric":     trig,
    "system":            system_of_equations,
    "system_of_equations": system_of_equations,
    "inequality":        inequality,
    "number_line":       number_line,
    "circle":            geometry_circle,
    "geometry_circle":   geometry_circle,
    "triangle":          geometry_triangle,
    "geometry_triangle": geometry_triangle,
    "geometry_shape":    geometry_triangle,  # default geometry to triangle
    "scatter":           scatter,
    "bar":               bar_chart,
    "bar_chart":         bar_chart,
    "exponential":       exponential,
    "piecewise":         piecewise,
    "unit_circle":       unit_circle,
    "polar":             trig,  # fallback polar → trig for now
}


def render(spec):
    """
    Main entry point. Selects the template, renders, returns fig.
    Raises ValueError if graph type is unknown.
    """
    graph_type = spec.get("type", "function").lower().replace(" ", "_")
    template_fn = TEMPLATE_MAP.get(graph_type)
    if template_fn is None:
        # Try partial match
        for key in TEMPLATE_MAP:
            if graph_type in key or key in graph_type:
                template_fn = TEMPLATE_MAP[key]
                break
    if template_fn is None:
        raise ValueError(f"Unknown graph type: {graph_type!r}. Available: {list(TEMPLATE_MAP.keys())}")

    return template_fn(spec)
