import { useState } from 'react';
import { 
  Mafs, 
  Coordinates, 
  Plot, 
  Point, 
  Line, 
  Polygon, 
  Text, 
  Vector,
  Theme
} from 'mafs';

// Import styles - these should ideally be in _app.js but adding here for portability
import "mafs/core.css";
import "mafs/font.css";

/**
 * MathVisual renders a high-fidelity coordinate plane based on a JSON layers spec.
 * Supports Algebra, Geometry, and Trigonometry with "tight" SOL details.
 */
export default function MathVisual({ layers = [], viewBox, labels = "integers", title, gridType = "cartesian" }) {
  // Default viewbox if none provided
  const finalViewBox = viewBox || { x: [-10, 10], y: [-10, 10], padding: 0.5 };
  
  // Local state for movable points to enable "Live Math"
  const [movablePointState, setMovablePointState] = useState({});

  // Strategy for labeling axes with PI
  const labelPi = (value) => {
    if (value === 0) return "0";
    const n = Math.round(value / Math.PI * 10) / 10;
    if (n === 1) return "π";
    if (n === -1) return "-π";
    if (Math.abs(n) === 0.5) return n > 0 ? "π/2" : "-π/2";
    return `${n}π`;
  };

  const compileFn = (fnStr) => {
    const cleanFn = typeof fnStr === 'string' ? fnStr.replace(/\^/g, '**') : '0';
    return (t) => {
      try {
        const { 
          sin, cos, tan, asin, acos, atan, 
          sinh, cosh, tanh, exp, log, pow, 
          sqrt, abs, floor, ceil, round, 
          PI, E 
        } = Math;
        // Provide multiple variable aliases for maximum AI compatibility
        return new Function('x', 'y', 't', 'theta', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'exp', 'log', 'pow', 'sqrt', 'abs', 'floor', 'ceil', 'round', 'PI', 'E', `return ${cleanFn}`)(
          t, t, t, t, sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, exp, log, pow, sqrt, abs, floor, ceil, round, PI, E
        );
      } catch (e) {
        console.error("Math Compilation Error:", e);
        return 0;
      }
    };
  };

  const renderLayer = (layer, index) => {
    if (!layer || !layer.type) return null;
    const { type, props = {} } = layer;
    const color = props.color || Theme.blue;

    switch (type) {
      case 'function': {
        const fnStr = props.fn || props.expression || props.y || '0';
        return <Plot.OfX key={index} y={compileFn(fnStr)} color={color} opacity={props.opacity || 1} />;
      }

      case 'polar': {
        const rFn = compileFn(props.fn || props.r || '1');
        return (
          <Plot.Parametric
            key={index}
            t={props.domain || [0, 2 * Math.PI]}
            xy={(t) => {
              const r = rFn(t);
              return [r * Math.cos(t), r * Math.sin(t)];
            }}
            color={color}
            opacity={props.opacity || 1}
          />
        );
      }

      case 'parametric': {
        if (!props.xFn || !props.yFn) return null;
        const xCompiled = compileFn(props.xFn);
        const yCompiled = compileFn(props.yFn);
        return (
          <Plot.Parametric
            key={index}
            t={props.domain || [0, 2 * Math.PI]}
            xy={(t) => [xCompiled(t), yCompiled(t)]}
            color={color}
          />
        );
      }

      case 'point': {
        if (props.x === undefined || props.y === undefined) return null;
        return (
          <Point
            key={index}
            x={Number(props.x)}
            y={Number(props.y)}
            color={color}
            label={props.label}
          />
        );
      }

      case 'line': {
        if (props.point1 && props.point2) {
          return <Line.Segment key={index} point1={props.point1} point2={props.point2} color={color} style={props.style || 'solid'} />;
        }
        if (props.point && props.slope !== undefined) {
          const p1 = props.point;
          return <Line.ThroughPoints key={index} point1={p1} point2={[p1[0] + 1, p1[1] + props.slope]} color={color} style={props.style || 'solid'} />;
        }
        return null;
      }

      case 'circle': {
        if (!props.center || props.radius === undefined) return null;
        const r = props.radius;
        const [cx, cy] = props.center;
        // Approximate circle as parametric
        return (
          <Plot.Parametric
            key={index}
            t={[0, 2 * Math.PI]}
            xy={(t) => [cx + r * Math.cos(t), cy + r * Math.sin(t)]}
            color={color}
            opacity={props.opacity || 1}
          />
        );
      }

      case 'text': {
        if (props.x === undefined || props.y === undefined) return null;
        return (
          <Text
            key={index}
            x={Number(props.x)}
            y={Number(props.y)}
            attach={props.attach || 'ne'}
            attachDistance={props.attachDistance || 15}
            size={props.size || 16}
          >
            {props.text || ''}
          </Text>
        );
      }

      case 'vector': {
        if (!props.tip) return null;
        return <Vector key={index} tail={props.tail || [0, 0]} tip={props.tip} color={color} />;
      }

      case 'polygon': {
        const points = props.points || props.vertices;
        if (!Array.isArray(points) || points.length < 3) return null;
        return <Polygon key={index} points={points} color={color} fillOpacity={props.fillOpacity || 0.2} />;
      }

      case 'segment':
      case 'ray':
      case 'arrow': {
        if (!props.point1 || !props.point2) return null;
        return <Line.Segment key={index} point1={props.point1} point2={props.point2} color={color} />;
      }

      default:
        return null;
    }
  };

  return (
    <div className="my-8 w-full max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-black/5 dark:border-white/10 overflow-hidden shadow-2xl">
        {title && (
          <div className="px-8 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-[0.7rem] font-black text-blue-500 uppercase tracking-[0.2em]">{title}</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-400/20"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400/20"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400/20"></div>
            </div>
          </div>
        )}
        
        <div className="p-2 md:p-4 bg-slate-50/50 dark:bg-slate-950/50">
          <Mafs 
            viewBox={finalViewBox} 
            height={400}
            preserveAspectRatio="contain"
          >
            {gridType === "polar" ? (
              <Coordinates.Polar />
            ) : (
              <Coordinates.Cartesian 
                xAxis={{
                  labels: labels === 'pi' ? labelPi : undefined,
                  lines: labels === 'pi' ? Math.PI / 2 : 1
                }}
                yAxis={{
                  lines: 1
                }}
              />
            )}
            {Array.isArray(layers) && layers.map((layer, index) => {
              try { return renderLayer(layer, index); }
              catch (e) { console.warn('MathVisual layer error:', e, layer); return null; }
            })}

          </Mafs>
        </div>
        
        <div className="px-8 py-4 bg-white/20 dark:bg-black/20 text-center">
          <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">
            Interactive Coordinate Engine • SOL Study Assistant
          </p>
        </div>
      </div>
    </div>
  );
}
