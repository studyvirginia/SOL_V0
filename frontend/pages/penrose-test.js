import PenroseRenderer from "../components/PenroseRenderer";

const DOMAIN = `
type Point
predicate Triangle(Point, Point, Point)
`;

const SUBSTANCE = `
Point A, B, C
Triangle(A, B, C)
AutoLabel All
`;

const STYLE = `
canvas {
  width = 350
  height = 350
}

forall Point p {
  p.dot = Circle {
    center : (?, ?)
    r : 5
    fillColor : #0f172a
  }
  p.lbl = Equation {
    center : p.dot.center + (0, -18)
    string : p.label
    fontSize : "18px"
  }
}

forall Point p, q, r
where Triangle(p, q, r) {
  side_pq = Line {
    start : p.dot.center
    end : q.dot.center
    strokeColor : #0f172a
    strokeWidth : 2.5
  }
  side_qr = Line {
    start : q.dot.center
    end : r.dot.center
    strokeColor : #0f172a
    strokeWidth : 2.5
  }
  side_rp = Line {
    start : r.dot.center
    end : p.dot.center
    strokeColor : #0f172a
    strokeWidth : 2.5
  }

  mid_c = Equation {
    center : (p.dot.center + q.dot.center) / 2 + (0, 14)
    string : "c"
    fontSize : "15px"
    fillColor : #2563eb
  }
  mid_a = Equation {
    center : (q.dot.center + r.dot.center) / 2 + (14, 0)
    string : "a"
    fontSize : "15px"
    fillColor : #2563eb
  }
  mid_b = Equation {
    center : (r.dot.center + p.dot.center) / 2 + (-14, 0)
    string : "b"
    fontSize : "15px"
    fillColor : #2563eb
  }

  ensure disjoint(p.dot, q.dot, 80)
  ensure disjoint(q.dot, r.dot, 80)
  ensure disjoint(r.dot, p.dot, 80)
}
`;

export default function PenroseTest() {
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 16 }}>Penrose — Labeled Triangle</h2>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <PenroseRenderer domain={DOMAIN} substance={SUBSTANCE} style={STYLE} variation="triangle-test" />
      </div>
    </div>
  );
}
