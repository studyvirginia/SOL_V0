# Penrose Reference Documentation (Complete)

Source: https://penrose.cs.cmu.edu/docs/ref  
Last fetched: April 10, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Using Penrose](#using-penrose)
3. [Domain Language](#domain-language)
   - [Domain Overview](#domain-overview)
   - [Type Declarations](#type-declarations)
   - [Predicate Declarations](#predicate-declarations)
   - [Function and Constructor Declarations](#function-and-constructor-declarations)
4. [Substance Language](#substance-language)
   - [Substance Overview](#substance-overview)
   - [Single Substance Statements](#single-substance-statements)
   - [Indexed Substance Statements](#indexed-substance-statements)
   - [Literal Expressions](#literal-expressions)
5. [Style Language](#style-language)
   - [Style Overview](#style-overview)
   - [Namespaces](#namespaces)
   - [Selectors](#selectors)
   - [Selector Blocks](#selector-blocks)
   - [Collectors](#collectors)
   - [Literals in Style](#literals-in-style)
   - [Expressions](#expressions)
   - [Value Types](#value-types)
   - [Vectors and Matrices](#vectors-and-matrices)
   - [Function Library](#function-library)
   - [Shapes Overview](#shapes-overview)
   - [Circle](#circle)
   - [Ellipse](#ellipse)
   - [Equation](#equation)
   - [Group](#group)
   - [Image](#image)
   - [Line](#line)
   - [Path](#path)
   - [Polygon](#polygon)
   - [Polyline](#polyline)
   - [Rectangle](#rectangle)
   - [Text](#text)
   - [Random Sampling](#random-sampling)
   - [Passthrough SVG](#passthrough-svg)
   - [Interactivity (experimental)](#interactivity-experimental)
6. [JavaScript / TypeScript Integration](#javascript--typescript-integration)
   - [The Language API](#the-language-api)
   - [Using Penrose with Vanilla JS](#using-penrose-with-vanilla-js)
   - [Using Penrose with a Bundler](#using-penrose-with-a-bundler)
   - [Using Penrose with React](#using-penrose-with-react)
7. [The Optimization API](#the-optimization-api)
8. [Using Penrose with SolidJS](#using-penrose-with-solidjs)
9. [Writing Constraints & Objectives](#writing-constraints--objectives)

---

## Overview

Why write a program instead of dragging shapes around? There are plenty of visual design tools. While popular, these tools tend to lack composability, generality, and reusability. Creators spend a large amount of time moving shapes around trying to get everything "just right." The more complex the diagram, the longer it takes to make. And for the next diagram, they get to do the same work all over again.

Graphical specification also demands that you already know how to visualize a particular abstract idea, and it ties mathematical content to one specific visual representation.

Penrose, instead, provides the level of abstraction needed to **separate content from representation**, which is extremely powerful.

Penrose already understands the diagram's domain and how to style the diagram. You just define the objects and relationships. Penrose goes to work by converting the three programs into an optimization problem that it solves using symbolic differentiation. If you need to add a new shape, it's not a painstaking exercise — Penrose automatically creates a new diagram that meets all of your constraints.

### Why "Penrose"?

Named after Sir Roger Penrose, known for his Escher-inspired illustrations of impossible objects, Penrose notations, and Penrose diagrams. "Pen" and "rose" also encapsulate turning notations ✍️ to beautiful diagrams 🌹.

### The Penrose Trio

A diagram made in Penrose involves a trio of three programs:

- A **Domain** (`.domain`) program describes for a given domain the types of objects, predicates, and functions that comprise diagrams in this domain.
- A **Substance** (`.substance`) program defines the objects and relationships in the diagram.
- A **Style** (`.style`) program tells Penrose how to display the objects and relationships.

Often, you only need to write the Substance program. Here's an example:

```substance
Set A, B, C, D, E
AutoLabel All
```

### Language References

- [Domain language reference](https://penrose.cs.cmu.edu/docs/ref/domain/overview)
- [Substance language reference](https://penrose.cs.cmu.edu/docs/ref/substance/overview)
- [Style language reference](https://penrose.cs.cmu.edu/docs/ref/style/overview)
- [Function Library](https://penrose.cs.cmu.edu/docs/ref/style/functions)

---

## Using Penrose

### Online Editor

Visit https://penrose.cs.cmu.edu/try/index.html to start making diagrams in your browser.

- **Examples**: Load gallery examples from the "example" tab.
- **Editing**: Edit in the `.substance`, `.style`, and `.domain` tabs and hit "compile ▶" to view the diagram. Click "resample" to see another layout.
- **Save**: Click "Save" to save in local storage; appears under the "saved" tab with auto-save.
- **Share**: Share via GitHub Gist — sign into GitHub under "settings", then click "share" to create a gist and get a sharable link.
- **Export**: Supports PNG, SVG, SVG for LaTeX (exports `Equation` as raw text), and PDF.
- **SVG Upload**: SVGs exported by the editor contain metadata to re-load them; drag-and-drop under the "upload" tab.
- **Advanced (Debug Mode)**:
  - **Variation**: Each layout is identified by a variation string — change it to generate another layout.
  - **Step size**: Number of steps the layout engine takes per frame (default is high for instant display; try `50` to animate).
  - **Autostep and step**: Turn off "autostep" to manually step the layout engine.
  - **Interactive mode**: Enable experimental interactive features.
  - **Grid size**: Adjust grid size in "Diagram Variations."

### Command-line Interface: `roger`

`roger` is a CLI tool for generating diagrams from Penrose trios and serving local files to a local editor.

**Installation:**
```shell
npx @penrose/roger
# or install globally:
npm i -g @penrose/roger
```

**Diagram generation:**

`roger trio` can generate SVG from a trio of `.substance`, `.style`, `.domain` files (in any order) or a `.trio.json` file:

```json
{
  "substance": "./tree.substance",
  "style": ["./euler.style"],
  "domain": "./setTheory.domain",
  "variation": "PlumvilleCapybara104"
}
```

Run `roger trio --help` for more options. Use `roger trios [trios..]` for batch generation.

**Local development:** See [CONTRIBUTING.md](https://github.com/penrose/penrose/blob/main/CONTRIBUTING.md#contributing-to-penrose) for using `roger watch`.

---

## Domain Language

### Domain Overview

A Domain schema describes the types of objects, as well as relations between these objects, that Penrose diagrams work with. For example:

```domain
type Set

predicate Disjoint(Set s1, Set s2)
predicate Intersecting (Set s1, Set s2)
predicate Subset (Set s1, Set s2)
```

The Domain schema is **not** instructions for how to draw — that is the Style schema's job. There are four types of statements: Type, Predicate, Function, and Constructor declarations.

**Comments:** Lines starting with `--` are ignored:
```domain
-- this is a comment
```

---

### Type Declarations

A type is a class of objects that a diagram works with. Syntax:

```domain
type typename
```

**Subtypes:**

```domain
type Atom
type Hydrogen <: Atom
type Oxygen <: Atom
```

Subtyping describes "is-a" relationships. If Penrose expects type `A`, it also accepts type `B` if `B` is a subtype of `A`.

If types are already declared, just omit the `type` keyword:

```domain
Hydrogen <: Atom
Oxygen <: Atom
```

**Literal Types:**

The domain schema provides two built-in literal types: `String` and `Number`. These can be referenced without declaration:

```domain
type Set
predicate Has(Set s, Number n)
```

**Restrictions on Literal Types:**
- `type Number` and `type String` declarations are disallowed (they conflict with built-ins).
- Literal types cannot be supertyped or subtyped.
- Literal types cannot be outputs of functions or constructors.

---

### Predicate Declarations

A predicate represents mathematical or logical statements regarding zero or more objects. Syntax:

```domain
predicate predicate_name (argument_list)
```

Example:
```domain
type FirstType, SecondType

predicate P1 (FirstType, SecondType)
predicate P2 (SecondType a1, SecondType a2)
predicate P3 ()
predicate P4 (FirstType, SecondType, SecondType)
```

Argument names (e.g. `a1`, `a2`) are optional but encouraged for readability.

**Symmetric Predicates:**

Some relations are symmetric (e.g., "intersects"). Penrose supports:

```domain
symmetric predicate predicate_name (argument_type, argument_type)
```

Only binary predicates (two arguments of the same type) can be symmetric:

```domain
type Atom
type Hydrogen <: Atom
type Oxygen <: Atom
symmetric predicate Bond (Atom, Atom)
```

With `Bond` declared symmetric, `Bond(H, O)` and `Bond(O, H)` are treated as equivalent.

---

### Function and Constructor Declarations

**Functions:**

```domain
function function_name (argument_list) -> output_type
```

Example:
```domain
type Vector
function addVector (Vector v1, Vector v2) -> Vector
```

**Constructors:**

```domain
constructor constructor_name (argument_list) -> output_type
```

Optionally, if the constructor name matches the output type, omit the output type:

```domain
constructor constructor_name (argument_list)
```

Constructors are functionally equivalent to functions but can additionally be invoked with the `Let` keyword in Substance.

---

## Substance Language

### Substance Overview

The Substance program tells Penrose what objects and relations to draw. Example:

```substance
Set A, B, C

Subset (A, C)
Subset (B, C)
Disjoint (A, B)

AutoLabel All
```

The Substance program does **not** contain instructions for how to render objects — that is the Style program's job.

A Substance program may contain two types of statements: [single statements](#single-substance-statements) or indexed statements.

**Comments:**
```substance
-- this is a comment
```

---

### Single Substance Statements

#### Object Declarations

```substance
type_name object_name
```

Multiple objects of the same type at once:
```substance
type_name object_name_1, object_name_2, ...
```

#### Predicate Applications

```substance
predicate_name (argument_list)
```

The types of objects in `argument_list` must match the domain declaration (subtyping allowed). Example:

```domain
type Atom
type Hydrogen <: Atom
type Oxygen <: Atom
type NotAnAtom
predicate Bond (Atom, Atom)
```

```substance
Hydrogen H
Oxygen O
Atom A
NotAnAtom NA
```

| Call | Valid? | Reason |
|------|--------|--------|
| `Bond (H, O)` | Yes | |
| `Bond (H, H)` | Yes | |
| `Bond (O, A)` | Yes | |
| `Bond (NA, H)` | No | `NA` has type `NotAnAtom`, doesn't match `Atom` |

#### Function and Constructor Applications

First way (declare object beforehand):
```substance
object_name := function_constructor_name (argument_list)
```

Second way (combined declaration + invocation):
```substance
type_name object_name := function_constructor_name (argument_list)
```

Constructors only, using `Let`:
```substance
Let object_name := constructor_name (argument_list)
```

#### Labeling Statements

Each declared object has a label accessible in Style.

- `AutoLabel All` — assigns each object's label to its name.
- `Label object_name label_value` — manually assigns a label:
  - Math label: `Label p $p_0$`
  - Text label: `Label p "a point"`
- `NoLabel object_list` — ensures objects have no label.

---

### Indexed Substance Statements

Substance allows defining indexed expressions that expand into multiple statements. Syntax:

```substance
statement_with_template_identifiers for index_var in [min, max]
```

**Example:**
```substance
Vector v_i for i in [0, 2]
-- equivalent to: Vector v_0, v_1, v_2
```

Templated identifiers like `v_i` use the last underscore + following substring as the index variable. `i in [x, y]` requires `x ≤ i ≤ y` (integer). Ranges like `[3, 0]` have no effect.

**Multiple index variables** (Cartesian product):

```substance
Orthogonal(v_i, v_j) for i in [0, 1], j in [1, 2]
-- expands into: Orthogonal(v_0, v_1); Orthogonal(v_0, v_2);
--               Orthogonal(v_1, v_1); Orthogonal(v_1, v_2)
```

Regular (non-templated) identifiers inside indexed statements pass through unchanged:
```substance
Orthogonal(v_i, vec1) for i in [0, 3]
-- `vec1` has no underscore, so it's a regular substance variable
```

#### Conditional Filtering

Use `where` to filter combinations:

```substance
Vector v_i for i in [0, 10] where i % 2 == 0
-- even indices: 0, 2, 4, 6, 8, 10

Orthogonal(v_i, v_j) for i in [0, 2], j in [0, 2] where i <= j
-- triangular range: [0,0], [0,1], [0,2], [1,1], [1,2], [2,2]

Edge(v_i, v_j) for i in [0, 4], j in [0, 4] where j == (i + 1) mod 5
-- cyclic pairs: [0,1], [1,2], [2,3], [3,4], [4,0]
```

Boolean expressions support: `true`, `false`, `!`, `&&`, `||`, and comparisons `==`, `!=`, `<`, `>`, `<=`, `>=`.

Numerical expressions support: float constants, index variables, unary `-`, and binary `+`, `-`, `*`, `/`, `%` (or `mod`), `^`.

> **WARNING:** Same tokenizer bug as Style — `2+1` is parsed as `2` and `+1`. Always put spaces around `+` and `-`: write `2 + 1`, `n - 1`, etc. See [issue #1516](https://github.com/penrose/penrose/issues/1516).

#### Duplications

Indexed statements follow the same duplicate rules as single statements:
- Re-declaring an object that already exists → error
- Duplicate predicate applications → allowed (silently deduplicated)

```substance
Vector v_0
Vector v_i for i in [0, 2]  -- error: v_0 already declared

Orthogonal(v_0, v_1)
Orthogonal(v_i, v_j) for i in [0, 2], j in [0, 2] where i != j
-- ok: duplicate predicates are fine
```

#### Accessing Individual Elements

Generated identifiers can be used as regular identifiers elsewhere:

```substance
Vector v_i for i in [0, 2]
LinearlyDependent(v_0, v_2)  -- ok
```

---

### Literal Expressions

Domain declares two built-in literal types: `Number` and `String`.

- Number literals: `1.234`, `5`, `-3.14159` → type `Number`
- String literals: `"hello world"` → type `String`

Explicit declarations like `String s` or `Number n` are **disallowed**.

**Using Literal Expressions as Arguments:**

```domain
type Set
predicate HasNum(Set set, Number num)
predicate HasStr(Set set, String str)
```

```substance
Set s1, s2
HasNum(s1, 1.234)
HasNum(s1, 2)
HasStr(s1, "Hello")
HasNum(s2, 5.678)
HasNum(s2, -5.678)
HasStr(s2, "world")
```

**Literal Expressions in Indexed Statements:**

Within an indexed statement, if an identifier name matches the template variable name, Substance treats it as a numerical literal:

```substance
NumberSet s
Contains(s, i) for i in [1, 10]
-- expands into Contains(s, 1), Contains(s, 2), ..., Contains(s, 10)
```

---

## Style Language

### Style Overview

A Style program translates objects and relationships from a Substance program into graphical icons and geometric relationships on a 2D canvas.

A Style program is composed of three types of blocks:

- **Namespaces** — specify constants such as canvas dimensions, colors, and other constant values.
- **Selector blocks** — match on Substance statements and specify shapes and diagram layout.
- **Collector blocks** — like selectors, but aggregate match results into collections.

---

### Namespaces

Syntax:
```style
namespace_name {
    -- ... (the namespace body)
}
```

Values declared within a namespace are read outside using the dot operator:
```style
namespace_name.field_name
```

These are also called **global variables**. Overwriting them is not allowed.

**Canvas Preamble Block:**

Each Style program must contain a canvas preamble block:

```style
canvas {
    width = 800
    height = 700
}
```

---

### Selectors

Selectors are the most important component in a Style program. Syntax:

```style
forall list_object_declarations
where list_relations
with list_object_declarations {
    ... (Selector Body)
}
```

- `list_object_declarations` is a semicolon-separated list: `type_name object_name`. These are called **style variables**.
- `list_relations` is a semicolon-separated list of constraints that must be satisfied.
- The `forall` clause must come first; `where` and `with` can appear in any order.
- Empty `where`/`with` clauses must be omitted entirely.

Examples:
```style
forall Set x { }

forall Set x; Set y
where Subset (x, y) { }

forall Set x
where IsSubst(x, y)
with Set y { }
```

#### Matching Against Substance

Penrose searches through the Substance program to find mappings from style variables to substance variables. Given:

```substance
Set A, B, C
Subset (A, B)
Subset (B, C)
```

and a style block `forall Set x; Set y where Subset(x, y)`, only two valid mappings exist: `x→A, y→B` and `x→B, y→C`.

#### Repeatable vs Non-Repeatable Matching

By default, two style variables must map to **different** substance variables. To allow the same variable to match multiple style variables:

```style
forall repeatable Node a; Node b
where Edge(a, b)
```

#### Object Declarations

- **Substance objects** (backtick-wrapped): `forall Set \`A\` { }` — only matches the substance object named exactly `A`.
- **Style objects** (no backticks): `forall Set x { }` — matches any substance object of type `Set`.

#### Relations

**Predicate applications:**
```style
predicate_name (argument_list)
```

Optionally give an alias:
```style
predicate_name (argument_list) as alias_name
```

**Symmetry:** If a predicate is `symmetric`, `Bond(h, o)` in a style block matches `Bond(O, H)` in substance.

**Function and constructor applications:**
```style
object_name := function_name (argument_list)
```

**Object property relations:**
```style
forall Set s
where s has label {
    ... some code that uses s.label
}
```

Use `where s has math label` or `where s has text label` to distinguish label types.

#### Matching Deduplication

The algorithm avoids duplicate mappings. If two mappings yield the same matched objects and equivalent matched relations, only one triggers.

#### Reserved Variables

- `match_total` — total number of times this Style block will be triggered.
- `match_id` — 1-indexed ordinal of the current matching.

---

### Selector Blocks

The body of a block contains declarations of variables, shapes, and relationships.

#### Assignments

```style
type_annotation field = expression
```

`field` is either:
- A single identifier (local assignment, not accessible outside this matching), or
- `object_name.identifier` (bound to the Substance instance, accessible in later matchings).

Example:
```style
forall MyType t1; MyType t2
where MyPredicate (t1, t2) as r1 {
    x =       -- local assignment
    t1.a =    -- bound to substance instance of `MyType t1`
    r1.c =    -- bound to substance instance of `MyPredicate(t1, t2)`
}
```

#### Override and Deletion

```style
forall Set X {
    shape X.shape = Circle {
        x: X.x
        r: 100
    }
}

forall Set `A` {
    override `A`.shape.r = 200
}
```

Deletion:
```style
forall T x {
    x.widget = Circle { }
}

forall S x {
    delete x.widget
}
```

#### Constraints and Objectives

```style
ensure constraint_name (argument_list)
encourage objective_name (argument_list)
```

Syntax sugar:
- `a > b` → `greaterThan(a, b)`
- `a == b` → `equal(a, b)`
- `a < b` → `lessThan(a, b)`

#### Layering

```style
layer shape_1 above shape_2
layer shape_1 below shape_2
```

`Group` shapes have special layering semantics (see Group section).

---

### Collectors

Selectors produce independent matches. Collectors enable aggregations over multiple matches.

Syntax:
```style
collect <COLLECT> into <INTO>
where <WHERE>
with <WITH>
foreach <FOREACH> { }
```

- `<COLLECT>`: object declaration — matched objects are collected.
- `<INTO>`: name assigned to the collection (conceptually a list of Substance objects).
- `<WHERE>`, `<WITH>`: same meaning as in `forall` selectors.
- `<FOREACH>`: groups `<COLLECT>` objects; the block runs once per distinct match of `<FOREACH>`.

Example:
```substance
Set s1
Element e1, e2
In(e1, s1)
In(e2, s1)

Set s2
Element e3, e4, e5
In(e3, s2)
In(e4, s2)
In(e5, s2)
```

```style
collect Element e into es
where In(e, s)
foreach Set s {
    ...
}
```

Runs twice: once with `es → [e1, e2], s → s1` and once with `es → [e3, e4, e5], s → s2`.

#### Collection Access Expression

```style
listof <FIELD NAME> from <COLLECTION NAME>
```

Takes the field from each substance variable in the collection.

Allowed input → output types:

| Input | Output |
|-------|--------|
| FloatV (number) | VectorV (vector) |
| VectorV (vector) | MatrixV (matrix) |
| ListV (list) | LListV (list of lists) |
| TupV (2-tuple) | PtListV (list of 2d points) |
| some shape | ShapeListV (list of shapes) |

#### Collection Count Expression

```style
numberof <COLLECTION NAME>
```

Returns the number of elements in the collection.

#### Repeatable Matching in Collectors

```style
collect repeatable Set s into ss
where Subset(s, a)
with Set a
```

---

### Literals in Style

#### Declarations of Literals

Unlike Substance, within a Style selector block, you can declare objects of literal types:

```style
forall Number n {}
forall String s {}
```

#### Uses of Literals

If a predicate argument expects a literal type, the style variable is automatically inferred:

```style
forall Set s
where Has(s, n) {}  -- n is automatically inferred as Number
```

Literal expressions can also appear directly in style selectors (matching only that exact literal):

```style
forall Set s
where Has(s, 1) {}  -- only matches Has(s, 1), not Has(s, 2)
```

#### Literals in Selector Body

If `x` refers to a Substance literal, accessing `x` directly gives its value. If `xs` is a collection of substance literals (numbers), accessing `xs` gives a vector of values. `nameof x` returns a string representation of the literal.

---

### Expressions

The list of supported Style types:

- `scalar`, `int`, `bool`, `string`, `path`, `color`, `file`, `style`, `shape`
- `vec2`, `vec3`, `vec4`
- `mat2x2`, `mat3x3`, `mat4x4`
- `function`, `objective`, `constraint`

#### Shapes

Shape declarations:
```style
shape_name {
    property_name_1 : value_1
    property_name_2 : value_2
}
```

Access properties:
```style
path_to_shape.property_name
```

Example:
```style
forall Set x {
    x.shape = Circle {
        r : 50
    }
    x.shape.center[0] = 50
    x.shape.center[1] = 100
}
```

#### Unknown Scalar

`?` evaluates to a scalar whose value is automatically determined by the Penrose engine. Provide an explicit initial value with `?[3.14]`.

#### Strings

```style
string fancyLabel = "(" + x.label + ")"
```

#### Colors

- `rgba(r, g, b, a)` — red, green, blue, alpha in [0, 1].
- `#rrggbbaa` — hexadecimal (alpha defaults to 1.0 if omitted).
- `hsva(h, s, v, a)` — hue [0, 360], saturation/value [0, 100], alpha [0, 1].
- `none()` — no fill/stroke (different from 100% transparent).

#### Computation Functions

Functions like `rgba`, `hsva`, `none`, and many mathematical functions. See the [Function Library](https://penrose.cs.cmu.edu/docs/ref/style/functions).

#### Arithmetic Operations

Standard: `c + d`, `c - d`, `c * d`, `c / d`.

> **WARNING:** Due to a tokenizer bug, expressions like `2+1` are parsed as two numbers (`2` and `+1`), not `2 + 1`. Always put spaces around `+` and `-` operators. See [issue #1516](https://github.com/penrose/penrose/issues/1516).

#### Style-Variable-Level Expressions

- `listof field from collection` — collection access (see Collectors).
- `numberof collection` — collection count.
- `nameof x` — returns the name of the Substance variable `x` maps to.

---

### Value Types

| Value | Type | Construction |
|-------|------|-------------|
| Numbers | `FloatV` | numerical value or `?` |
| Booleans | `BoolV` | `true` or `false` |
| Strings | `StrV` | `"hello world"`, concatenation with `+` |
| Path data | `PathDataV` | via path functions |
| List of points | `PtListV` | matrix or list of lists |
| Colors | `ColorV` | `rgba(...)`, `hsva(...)`, `none()`, `#rrggbbaa` |
| List of numbers | `ListV` | `[1, 2, ?, 4, 5]` |
| Vectors | `VectorV` | `(1, 2, 3, ?, 5)` |
| Matrices | `MatrixV` | `((1,2,3),(4,5,6),(7,8,9))` |
| Tuples | `TupV` | `{1, ?}` |
| List of lists | `LListV` | `[[1,2,3],[4,5,6]]` |
| List of shapes | `ShapeListV` | `[t.shape1, t.shape2]` |

**Implicit Casting:**
- `ListV` ↔ `VectorV`
- `MatrixV`, `LListV`, `PtListV` ↔ each other
- `TupV` → `ListV` and `VectorV` (not vice versa)

Penrose's types are not strictly enforced except when acting as shape parameters.

---

### Vectors and Matrices

Style supports dense n-dimensional vector (`vecN`) and square n-dimensional matrix (`matNxN`) types.

#### Vector and Matrix Types

Common types: `vec2`, `vec3`, `vec4`, `mat2x2`, `mat3x3`, `mat4x4`.

#### Initializing Vectors and Matrices

```style
vec2 u = (1.23, 4.56)
vec2 p = (?, 0.0)   -- x is unknown, y is fixed at 0
mat2x2 A = ((1,2),(3,4))
```

Matrix rows can reference existing vectors:
```style
vec2 a1 = (1, 2)
vec2 a2 = (3, 4)
mat2x2 A = (a1, a2)
```

#### Vector and Matrix Element Access

```style
vec3 u = (1, 2, 3)
scalar y = u[1]  -- y = 2

mat2x2 M = ((?, ?), (?, ?))
scalar trM = M[0][0] + M[1][1]
```

Note: Single indexing to extract a row vector from a matrix is **not** currently supported (see [issue #1509](https://github.com/penrose/penrose/issues/1509)).

#### Vector and Matrix Operations

Assuming `c`, `d` are `scalar`, `u`, `v` are `vecN`, `A`, `B` are `matNxN`:

**Scalar-Vector:** `c * v`, `v * c`, `v / c`
**Scalar-Matrix:** `c * A`, `A * c`, `A / c`
**Vector-Vector:** `u + v`, `u - v`, `u .* v` (elementwise), `u ./ v` (elementwise)
**Vector-Matrix:** `A*u` (matrix-vector product `Au`), `u*A` (product `uᵀA`)
**Matrix-Matrix:** `A * B`, `A + B`, `A - B`, `A .* B`, `A ./ B`, `A'` (transpose), `A then B` (= `BA`)

**The `then` keyword:** Applies transformations left-to-right (natural language order):
```style
mat4x4 transform = translate(x,y) then rotate(theta) then scale(a,b)
-- equivalent to: rotate(theta) * scale(a,b) * translate(x,y)
```

#### 2D and 3D Transformation Matrices

**2D transformations (affine, homogeneous coordinates):**
- `rotate(theta)`, `scale(a,b)`, `skew(...)`, `shear(...)`, `translate(x,y)`

**2D transformations (linear, Cartesian coordinates):**
- `rotate2d(theta)`, `scale2d(a,b)`, `skew2d(...)`, `shear2d(...)`

**3D transformations (linear, Cartesian coordinates):**
- `rotate3d(theta,u)`, `scale3d(a,b,c)`, `shear3d(...)`

**3D transformations (affine, homogeneous coordinates):**
- `rotate3dh(theta,u)`, `scale3dh(a,b,c)`, `shear(...)`, `translate3dh(x,y,z)`

**Naming convention:**
- No suffix → 2D affine in homogeneous coordinates
- `2D` suffix → 2D linear in Cartesian coordinates
- `3D` suffix → 3D linear in Cartesian coordinates
- `3dh` suffix → 3D affine in homogeneous coordinates

**Homogeneous coordinate helpers:**
`fromHomogeneous`, `fromHomogeneousList`, `toHomogeneous`, `toHomogeneousList`, `toHomogeneousMatrix`

**Camera matrices (OpenGL-style):**
`lookAt`, `perspective`, `ortho`, `project`, `projectDepth`, `projectList`, `matrixMultiplyList`

**Example 3D usage:**
```style
vec3 p = (1,2,3)
mat4x4 A = translate3dh(x,y,z) then rotate3dh(theta,u) then scale3dh(a,b,c)
vec3 q = fromHomogeneous( A * toHomogeneous(p) )
```

---

### Function Library

Source: https://penrose.cs.cmu.edu/docs/ref/style/functions

---

#### Constraint Functions

Constraints are called with `ensure constraint_name(args)` in a Style selector block. Negative output = satisfied; positive = violated.

| Constraint | Signature | Description |
|------------|-----------|-------------|
| `equal` | `(x, y)` | Require x equals y |
| `lessThan` | `(x, y, padding?)` | Require x < y with optional padding |
| `greaterThan` | `(x, y, padding?)` | Require x > y with optional padding |
| `lessThanSq` | `(x, y)` | Require x < y (steeper penalty) |
| `greaterThanSq` | `(x, y)` | Require x > y (steeper penalty) |
| `inRange` | `(x, x0, x1)` | Require x ∈ [x0, x1] |
| `contains1D` | `([l1,r1], [l2,r2])` | Require interval [l1,r1] contains [l2,r2] |
| `disjointScalar` | `(c, left, right)` | Make scalar c disjoint from range [left, right] |
| `perpendicular` | `(q, p, r)` | Require vector (q,p) perpendicular to (r,p) |
| `collinear` | `(c1, c2, c3)` | Require three points be collinear (any order) |
| `collinearOrdered` | `(c1, c2, c3)` | Require collinear in exact order given |
| `onCanvas` | `(shape, canvasWidth, canvasHeight)` | Require shape is on the canvas |
| `overlapping` | `(s1, s2, overlap?)` | Require shapes overlap (with optional margin) |
| `overlappingEllipses` | `(c1, rx1, ry1, c2, rx2, ry2, overlap?)` | Require two ellipses overlap |
| `overlappingCircleEllipse` | `(c1, r1, c2, rx2, ry2, overlap?)` | Require circle overlaps ellipse |
| `disjoint` | `(s1, s2, padding?)` | Require shapes are disjoint (with optional padding) |
| `touching` | `(s1, s2, padding?)` | Require shapes are touching |
| `contains` | `(s1, s2, padding?)` | Require s1 contains s2 (with optional padding) |
| `containsCircles` | `(c1, r1, c2, r2, padding?)` | Require circle c1 contains circle c2 |
| `containsPolys` | `(pts1, pts2, padding?)` | Require polygon p1 contains polygon p2 |
| `containsPolyCircle` | `(pts, c, r, padding?)` | Require polygon p contains circle c |
| `containsPolyPoint` | `(pts, pt, padding?)` | Require polygon p contains point pt |
| `containsCirclePoint` | `(c, r, pt, padding?)` | Require circle c contains point pt |
| `containsCirclePoly` | `(c, r, pts, padding?)` | Require circle c contains polygon p |
| `containsCircleRect` | `(c, r, rect, padding?)` | Require circle c contains rectangle rect |
| `containsRectCircle` | `(rect, c, r, padding?)` | Require rectangle contains circle |
| `containsRects` | `(rect1, rect2, padding?)` | Require rect1 contains rect2 |
| `distributeHorizontally` | `(shapes, padding?, leftToRight?)` | Even horizontal spacing between shapes |
| `distributeVertically` | `(shapes, padding?, topToBottom?)` | Even vertical spacing between shapes |
| `disjointIntervals` | `(s1, s2)` | Make two line-like intervals disjoint |
| `isLocallyConvex` | `(points, closed)` | Shape should be locally convex |
| `isConvex` | `(points, closed)` | Enclosed area should be convex |
| `isEquilateral` | `(points, closed)` | All edges should have the same length |
| `isEquiangular` | `(points, closed)` | All angles between edges should be equal |

---

#### Objective Functions

Objectives are called with `encourage objective_name(args)`. They output a "badness" value with local minimum at the desired configuration.

| Objective | Signature | Description |
|-----------|-----------|-------------|
| `minimal` | `(x)` | Encourage x → −∞ |
| `maximal` | `(x)` | Encourage x → +∞ |
| `equal` | `(x, y)` | Encourage x == y: `(x-y)²` |
| `nearVec` | `(v1, v2, offset?)` | Encourage two vectors to be near each other |
| `greaterThan` | `(x, y)` | Encourage x ≥ y: `max(0, y-x)²` |
| `lessThan` | `(x, y)` | Encourage x ≤ y: `max(0, x-y)²` |
| `repelPt` | `(weight, a, b)` | Repel point a from point b |
| `repelScalar` | `(c, d)` | Repel scalar c from scalar d |
| `inDirection` | `(p, pRef, direction, offset?)` | Encourage p to be in direction from pRef |
| `below` | `(bottom, top, offset?)` | Encourage bottom center to be below top center |
| `above` | `(top, bottom, offset?)` | Encourage top center to be above bottom center |
| `leftwards` | `(left, right, offset?)` | Encourage left to be leftward of right |
| `rightwards` | `(right, left, offset?)` | Encourage right to be rightward of left |
| `sameCenter` | `(s1, s2)` | Encourage s1 and s2 to share center position |
| `notTooClose` | `(s1, s2, weight?)` | Repel s1 from s2 |
| `near` | `(s1, s2, offset?)` | Place s1 near s2 (same center) |
| `nearPt` | `(s1, x, y)` | Place s1 near location (x, y) |
| `nonDegenerateAngle` | `(s0, s1, s2, strength?, range?)` | Encourage non-degenerate angle |
| `centerLabelAbove` | `(s1, s2, w)` | Center label s2 above line s1 |
| `centerLabel` | `(s1, s2, w, padding?)` | Center label s2 with respect to s1 |
| `pointLineDist` | `(point, s1, padding)` | Make distance from point to line equal to padding |
| `isRegular` | `(points, closed)` | Make shape regular |
| `isEquilateral` | `(points, closed)` | Make shape equilateral (objective) |
| `isEquiangular` | `(points, closed)` | Make shape equiangular (objective) |

---

#### Computation Functions

**Colors:**

| Function | Returns | Description |
|----------|---------|-------------|
| `rgba(r, g, b, a)` | Color | RGB color (r,g,b,a ∈ [0,1]) |
| `hsva(h, s, v, a)` | Color | HSV color (h∈[0,360], s/v∈[0,100], a∈[0,1]) |
| `none()` | Color | No paint |
| `setOpacity(color, frac)` | Color | Set opacity of a color |
| `selectColor(c1, c2, level)` | Color | Select between two colors |
| `sampleColor(alpha, colorType)` | Color | Sample a random color |

**Math:**

| Function | Returns | Description |
|----------|---------|-------------|
| `abs(x)` | ℝ | Absolute value |
| `sqr(x)` | ℝ | x² |
| `sqrt(x)` | ℝ | √x |
| `pow(x, y)` | ℝ | xʸ |
| `max(x, y)` | ℝ | Maximum of x, y |
| `min(x, y)` | ℝ | Minimum of x, y |
| `mod(a, n)` | ℝ | a mod n |
| `sign(x)` | ℝ | Sign of x |
| `ceil(x)`, `floor(x)`, `round(x)`, `trunc(x)` | ℝ | Rounding |
| `sin(x)`, `cos(x)`, `tan(x)` | ℝ | Trig (radians) |
| `asin(x)`, `acos(x)`, `atan(x)`, `atan2(x,y)` | ℝ | Inverse trig |
| `sinh(x)`, `cosh(x)`, `tanh(x)` | ℝ | Hyperbolic |
| `asinh(x)`, `acosh(x)`, `atanh(x)` | ℝ | Inverse hyperbolic |
| `exp(x)`, `expm1(x)`, `log(x)`, `log2(x)`, `log10(x)`, `log1p(x)` | ℝ | Exponential/log |
| `cbrt(x)` | ℝ | Cube root |
| `toRadians(theta)` | ℝ | Degrees → radians |
| `toDegrees(theta)` | ℝ | Radians → degrees |
| `MathPI()` | ℝ | π |
| `MathE()` | ℝ | e |

**Vectors:**

| Function | Returns | Description |
|----------|---------|-------------|
| `norm(v)` | ℝ | Euclidean norm |
| `normsq(v)` | ℝ | Squared norm |
| `normalize(v)` / `unit(v)` | ℝⁿ | Unit vector |
| `unitVector(theta)` | ℝ² | Unit vector at angle theta (radians) |
| `vdist(v, w)` | ℝ | Euclidean distance |
| `vdistsq(v, w)` | ℝ | Squared distance |
| `vmul(s, v)` | ℝⁿ | Scalar-vector product |
| `dot(v, w)` | ℝ | Dot product |
| `cross(u, v)` | ℝ³ | 3D cross product |
| `cross2D(u, v)` | ℝ | det of [u v] |
| `rot90(v)` | ℝ² | Rotate 90° CCW |
| `rotateBy(v, theta)` | ℝ² | Rotate by theta degrees CCW |
| `angleOf(v)` | ℝ | Angle with positive x-axis |
| `angleBetween(u, v)` | ℝ | Unsigned angle ∈ [0, π] |
| `angleFrom(u, v)` | ℝ | Signed angle from u to v ∈ [−π, π] |
| `mul(m, v)` | ℝⁿ | Matrix-vector product |
| `average(xs)` | ℝ | Average of list |
| `average2(x, y)` | ℝ | Average of two floats |
| `sum(xs)` | ℝ | Sum of vector elements |
| `sumVectors(vecs)` | ℝⁿ | Sum of list of vectors |
| `maxList(xs)` / `minList(xs)` | ℝ | Max / min of vector |
| `count(xs)` | ℝ | Number of elements |
| `get(xs, i)` | ℝ | i-th element (0-indexed) |
| `oneBasedElement(points, i)` | ℝ² | i-th point (1-indexed) |
| `repeat(n, k)` | ℝⁿ | Vector of n copies of k |

**Matrix operations:**

| Function | Returns | Description |
|----------|---------|-------------|
| `identity(n)` | n×n | n×n identity matrix |
| `diagonal(v)` | n×n | Diagonal matrix from v |
| `trace(A)` | ℝ | Trace |
| `determinant(A)` | ℝ | Determinant (2/3/4×) |
| `inverse(A)` | n×n | Matrix inverse (2/3/4×) |
| `outerProduct(v, w)` | n×n | vwᵀ |
| `crossProductMatrix(v)` | 3×3 | Skew-symmetric cross product matrix |

**Transforms** (also see [Vectors and Matrices](#vectors-and-matrices)):

| Function | Returns | Description |
|----------|---------|-------------|
| `matrix(a,b,c,d,e,f)` | 3×3 | SVG-style 2D affine |
| `matrix3d(a1..d4)` | 4×4 | CSS-style 3D (16 args, column-major) |
| `rotate(theta, x?, y?)` | 3×3 | 2D CCW rotation (affine) |
| `rotate2d(theta)` | 2×2 | 2D rotation (linear) |
| `rotate3d(theta, v)` | 3×3 | 3D rotation (linear) |
| `rotate3dh(theta, v)` | 4×4 | 3D rotation (homogeneous) |
| `scale(sx, sy)` | 3×3 | 2D scale (affine) |
| `scale2d(sx, sy)` | 2×2 | 2D scale (linear) |
| `scale3d(sx, sy, sz)` | 3×3 | 3D scale (linear) |
| `scale3dh(sx, sy, sz)` | 4×4 | 3D scale (homogeneous) |
| `skew(ax, ay?)` | 3×3 | 2D skew (affine) |
| `skew2d(ax, ay?)` | 2×2 | 2D skew (linear) |
| `shear(u, v)` | (n+1)× | Shear in direction u along v (affine) |
| `shear2d(u, v)` | 2×2 | 2D shear (linear) |
| `shear3d(u, v)` | 3×3 | 3D shear (linear) |
| `translate(x, y?)` | 3×3 | 2D translation |
| `translate3dh(x, y, z)` | 4×4 | 3D translation (homogeneous) |
| `toHomogeneous(p)` | n+1 | Cartesian → homogeneous |
| `fromHomogeneous(q)` | n | Homogeneous → Cartesian |
| `toHomogeneousList(P)` / `fromHomogeneousList(Q)` | list | Batch conversions |
| `toHomogeneousMatrix(A)` | (n+1)× | Embed matrix in affine space |

**3D camera:**

| Function | Returns | Description |
|----------|---------|-------------|
| `lookAt(eye, center, up)` | 4×4 | View matrix |
| `perspective(fovy, aspect, zNear?, zFar?)` | 4×4 | Perspective projection |
| `ortho(l, r, b, t, zNear?, zFar?)` | 4×4 | Orthographic projection |
| `project(p, model, proj, view)` | ℝ² | 3D → 2D window coordinates |
| `projectDepth(p, model, proj, view)` | ℝ³ | 3D → 2D + depth |
| `projectList(P, model, proj, view)` | list of ℝ² | Batch project |
| `matrixMultiplyList(A, V)` | list | Batch matrix-vector products |

**Points and geometry:**

| Function | Returns | Description |
|----------|---------|-------------|
| `midpoint(start, end)` | ℝⁿ | Midpoint |
| `midpointOffset(s1, padding)` | ℝ² | Midpoint of line offset normally |
| `ptOnLine(p1, p2, r)` | ℝⁿ | Point at distance r along p1→p2 |
| `lineLineIntersection(a0,a1,b0,b1)` | ℝ² | Line-line intersection |
| `firstPoint(points)` / `lastPoint(points)` | ℝ² | First / last point |
| `averagePoint(points)` | ℝⁿ | Mean of points |
| `barycenter(a,b,c)` | ℝ² | Triangle barycenter |
| `circumcenter(p,q,r)` | ℝ² | Triangle circumcenter |
| `circumradius(p,q,r)` | ℝ | Triangle circumradius |
| `incenter(p,q,r)` | ℝ² | Triangle incenter |
| `inradius(p,q,r)` | ℝ | Triangle inradius |
| `centerOfMass(points)` | ℝ² | Center of mass |
| `bboxPts(s)` | list of ℝ² | Bounding box corners (TL,TR,BR,BL) |
| `rectPts(s)` | list of ℝ² | Rect-like shape corners (with rotation) |

**Path construction:**

| Function | Returns | Description |
|----------|---------|-------------|
| `pathFromPoints(pathType, pts)` | PathCmd | Polyline / closed polygon |
| `quadraticCurveFromPoints(pathType, pts)` | PathCmd | Quadratic Bézier spline |
| `cubicCurveFromPoints(pathType, pts)` | PathCmd | Cubic Bézier spline |
| `interpolateQuadraticFromPoints(pathType, p0, p1, p2)` | PathCmd | Curve interpolating all 3 pts |
| `interpolatingSpline(pathType, points, tension?)` | PathCmd | Catmull-Rom spline |
| `arc(pathType, start, end, [w,h], rotation, largeArc, arcSweep)` | PathCmd | SVG arc |
| `circularArc(pathType, center, r, theta0, theta1)` | PathCmd | Circular arc |
| `repeatedArcs(innerStart,innerEnd,outerStart,outerEnd,innerRadius,repeat,spacing,arcSweep)` | PathCmd | Concentric arcs |
| `wedge(center, start, end, radius, rotation, largeArc, arcSweep)` | PathCmd | Filled arc wedge |
| `makePath(start, end, curveHeight, padding)` | PathCmd | Curved path between two points |
| `connectPaths(pathType, pathDataList)` | PathCmd | Join paths with connecting lines |
| `concatenatePaths(pathDataList)` | PathCmd | Union of paths |
| `joinPaths(pathDataList)` | PathCmd | Join (endpoints must coincide) |
| `Penrose(center?, radius?, holeSize?, angle?, nSides?, chirality?)` | PathCmd | Impossible polygon |

**Annotation helpers:**

| Function | Returns | Description |
|----------|---------|-------------|
| `chevron(s1, padding)` | list | Right-angle chevron at midpoint of line |
| `unitMark(s1, s2, padding)` | list | Two points for unit length mark |
| `unitMark2([start,end], t, size)` | list | End caps for unitMark |
| `orientedSquare(s1, s2, intersection, len)` | PathCmd | Right-angle perpendicular mark |
| `ticksOnLine(pt1, pt2, spacing, numTicks, tickLength)` | PathCmd | Tick marks on a line |
| `innerPointOffset(pt1, pt2, pt3, padding)` | ℝ² | Offset for right-angle marker |
| `triangle(l1, l2, l3)` | PathCmd | Triangle from three lines |
| `arcSweepFlag([x1,y1], start, end)` | ℝ | 0=CCW, 1=CW |

**Signed distance / shape queries:**

| Function | Returns | Description |
|----------|---------|-------------|
| `signedDistance(s, p)` | ℝ | Signed distance from shape to point |
| `signedDistanceCircle(c, r, pt)` | ℝ | Circle → point |
| `signedDistanceEllipse(c, rx, ry, pt)` | ℝ | Ellipse → point |
| `signedDistanceRect(rect, pt)` | ℝ | Rectangle → point |
| `signedDistancePolygon(pts, pt)` | ℝ | Polygon → point |
| `signedDistanceLine(start, end, pt)` | ℝ | Line → point |
| `signedDistancePolyline(pts, pt)` | ℝ | Polyline → point |
| `shapeDistance(s1, s2)` | ℝ | Distance between two shapes |
| `rectLineDist(bottomLeft, topRight, start, end)` | ℝ | Rectangle ↔ line |

**Ray intersections:**

| Function | Returns | Description |
|----------|---------|-------------|
| `rayIntersect(S, p, v)` | ℝ² | First intersection of ray p+tv |
| `rayIntersectDistance(S, p, v)` | ℝ | Distance to first intersection |
| `rayIntersectNormal(S, p, v)` | ℝ² | Unit normal at first intersection |
| Shape-specific variants: `rayIntersectCircle`, `rayIntersectEllipse`, `rayIntersectLine`, `rayIntersectRect`, `rayIntersectPoly`, `rayIntersectGroup` | ℝ² | Shape-specific intersections |

**Closest point:**

| Function | Returns | Description |
|----------|---------|-------------|
| `closestPoint(s, p)` | ℝ² | Closest point on shape to p |
| `closestSilhouettePoint(s, p)` | ℝ² | Closest silhouette point |
| `closestSilhouetteDistance(s, p)` | ℝ | Distance to silhouette |

**Curve analysis:**

| Function | Returns | Description |
|----------|---------|-------------|
| `signedArea(points, closed)` | ℝ | Signed enclosed area |
| `perimeter(points, closed)` | ℝ | Total length |
| `turningNumber(points, closed)` | ℝ | Turning number |
| `isoperimetricRatio(points, closed)` | ℝ | Perimeter² / area |
| `elasticEnergy(points, closed)` | ℝ | ∫ κ² |
| `totalCurvature(points, closed, signed?)` | ℝ | ∫ κ |
| `pElasticEnergy(points, closed, p)` | ℝ | ∫ κᵖ |
| `maxCurvature(points, closed)` | ℝ | Max κ |
| `curvatures(points, closed)` | ℝⁿ | κ at each point |c
| `tangentVectors(points, closed)` | list | Tangent vectors |
| `normalVectors(points, closed)` | list | Normal vectors |
| `evoluteCurve(points, closed)` | list | Evolute |
| `offsetCurve(points, closed, magnitude)` | list | Offset curve |
| `diffusionProcess(n, X0, A, omega)` | list | Stochastic diffusion path |

**Miscellaneous:**

| Function | Returns | Description |
|----------|---------|-------------|
| `length(l)` | ℝ | Length of a Line shape |
| `noClip()` | ClipData | No clipping |
| `clip(shape)` | ClipData | Clip by shape |
| `tsneEnergy(points, projectedPoints)` | ℝ | T-SNE energy |
| `TeXify(str)` | String | "hello_world" → "{hello}_{world}" |

---

### Shapes Overview

Style currently supports: `Circle`, `Ellipse`, `Equation`, `Group`, `Image`, `Line`, `Path`, `Polygon`, `Polyline`, `Rectangle`, `Text`.

In the attribute lists, `vec2` describes a 2D vector `u` with components `u[0]` and `u[1]`.

#### Using Shapes in Style

```style
x.myShape = Shape {
   attribute1: value1
   attribute2: value2
}
```

Example:
```style
forall Point x {
   x.myCircle = Circle {
      radius: 5
      fillColor: rgba(1,0,0,1)
   }
}
```

#### Keeping Shapes on the Canvas

All shapes have `ensureOnCanvas` (default: `true`) — keeps shape within the canvas bounding rectangle. Disable with `ensureOnCanvas: false`.

#### Strict Typing on Shape Parameters

Penrose enforces strict types on shape parameters. If you provide wrong types:

```
Shape property myShape.r expects type FloatV and does not accept type BoolV.
```

**Implicit Casting:**
- `ListV` ↔ `VectorV`
- `MatrixV`, `LListV`, `PtListV` ↔ each other
- `TupV` → `ListV` and `VectorV` (not vice versa)

---

### Circle

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultCircle" |
| strokeWidth | FloatV | 0 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | none() |
| strokeDasharray | StrV | "" |
| ensureOnCanvas | BoolV | true |
| fillColor | ColorV | sampled |
| center | VectorV | sampled |
| r | FloatV | sampled |

---

### Ellipse

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultEllipse" |
| strokeWidth | FloatV | 0 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | none() |
| strokeDasharray | StrV | "" |
| ensureOnCanvas | BoolV | true |
| fillColor | ColorV | sampled |
| center | VectorV | sampled |
| rx | FloatV | sampled |
| ry | FloatV | sampled |

---

### Equation

An `Equation` typesets mathematical expressions. It assumes `string` is a math-mode TeX expression rendered via MathJax. (For plain text, use `Text`.)

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultEquation" |
| fillColor | ColorV | rgba(0,0,0,1) |
| width | FloatV | 0 |
| height | FloatV | 0 |
| descent | FloatV | 0 |
| ascent | FloatV | 0 |
| rotation | FloatV | 0 |
| string | StrV | "defaultLabelText" |
| fontSize | StrV | "16px" |
| ensureOnCanvas | BoolV | true |
| center | VectorV | sampled |

---

### Group

A group contains multiple shapes, rendered under `<g>` tag:

```style
t.s1 = Circle {}
t.s2 = Rectangle {}
t.g = Group {
    shapes : [t.s1, t.s2]
}
```

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultGroup" |
| ensureOnCanvas | BoolV | true |
| shapes | ShapeListV | [] |
| clipPath | ClipDataV | {"tag":"NoClip"} |

**Constructing a Group:**
- All shapes within a group must be declared previously and referred by path (no inline declarations).
- A shape cannot be contained in multiple groups.

**Layering Semantics:**
- Layering directives on a group apply to all members.
- Layering directives on a group member apply to the entire group.

**Clipping:**

```style
g = Group {
    shapes: [s1, s2]
    clipPath: clip(s3)
}
```

- `noClip()` — no clipping.
- `clip(someShape)` — clip by `someShape` (cannot be another Group).
- Shape used for clipping is a conceptual group member; cannot be in multiple groups.

**Bounding Box:**
- Unclipped group: smallest axis-aligned rectangle containing all member bounding boxes.
- Clipped group: intersection of the group's bounding box and the clipping shape's bounding box.

---

### Image

Places an external SVG whose path is specified by `href`.

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultImage" |
| rotation | FloatV | 0 |
| href | StrV | "defaultImage" |
| ensureOnCanvas | BoolV | true |
| preserveAspectRatio | StrV | "" |
| center | VectorV | sampled |
| width | FloatV | sampled |
| height | FloatV | sampled |

---

### Line

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultLine" |
| strokeWidth | FloatV | 1 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | rgba(0,0,0,1) |
| strokeDasharray | StrV | "" |
| startArrowheadSize | FloatV | 1 |
| startArrowhead | StrV | "none" |
| flipStartArrowhead | BoolV | false |
| endArrowheadSize | FloatV | 1 |
| endArrowhead | StrV | "none" |
| strokeLinecap | StrV | "" |
| ensureOnCanvas | BoolV | true |
| fillColor | ColorV | none() |
| start | VectorV | sampled |
| end | VectorV | sampled |

Arrowhead styles are inspired by [quiver](https://q.uiver.app/) and are set via `startArrowhead` and `endArrowhead`.

---

### Path

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultPath" |
| strokeWidth | FloatV | 1 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | rgba(0,0,0,1) |
| strokeDasharray | StrV | "" |
| strokeLinecap | StrV | "butt" |
| fillColor | ColorV | none() |
| startArrowheadSize | FloatV | 1 |
| startArrowhead | StrV | "none" |
| flipStartArrowhead | BoolV | false |
| endArrowheadSize | FloatV | 1 |
| endArrowhead | StrV | "none" |
| d | PathDataV | [] |
| ensureOnCanvas | BoolV | true |

#### Defining an SVG path using `d`

**Line / connected line segments:**
```style
d: pathFromPoints("open", [[x1,y1],[x2,y2],...,[xn,yn]])
-- "closed" draws a line from last to first point
```

**Arc:**
```style
d: arc("open", start, end, radius, rotation, largeArc, arcSweep)
-- start/end: [x,y] coordinates
-- radius: [rx, ry]
-- rotation: degree of rotation of the ellipse
-- largeArc: 0=shorter arc, 1=longer arc
-- arcSweep: 0=counter-clockwise, 1=clockwise
```

**Curve through three points** (quadratic):
```style
d: interpolateQuadraticFromPoints("open", p0, p1, p2)
-- actually passes through all three points (not a standard Bézier)
```

---

### Polygon

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultPolygon" |
| strokeWidth | FloatV | 0 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | none() |
| strokeDasharray | StrV | "" |
| scale | FloatV | 1 |
| points | PtListV | [[0,0],[0,10],[10,0]] |
| ensureOnCanvas | BoolV | true |
| fillColor | ColorV | sampled |

---

### Polyline

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultPolyline" |
| strokeWidth | FloatV | 1 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | rgba(0,0,0,1) |
| strokeDasharray | StrV | "" |
| strokeLinecap | StrV | "butt" |
| fillColor | ColorV | none() |
| scale | FloatV | 1 |
| points | PtListV | [[0,0],[0,10],[10,0]] |
| ensureOnCanvas | BoolV | true |

---

### Rectangle

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultRectangle" |
| strokeWidth | FloatV | 0 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | none() |
| strokeDasharray | StrV | "" |
| cornerRadius | FloatV | 0 |
| rotation | FloatV | 0 |
| ensureOnCanvas | BoolV | true |
| fillColor | ColorV | sampled |
| center | VectorV | sampled |
| width | FloatV | sampled |
| height | FloatV | sampled |

---

### Text

A `Text` shape displays plain text (use `Equation` for math). All text is centered vertically and horizontally by default.

The `width` and `height` are **automatically set** to the bounding box — do not set these manually, but you can use them:

```style
-- draw a rectangle around a Text shape t
Rectangle {
    width: t.width
    height: t.height
    center: t.center
}
```

| Property | Type | Default |
|----------|------|---------|
| name | StrV | "defaultText" |
| strokeWidth | FloatV | 0 |
| strokeStyle | StrV | "solid" |
| strokeColor | ColorV | none() |
| strokeDasharray | StrV | "" |
| fillColor | ColorV | rgba(0,0,0,1) |
| width | FloatV | 0 |
| height | FloatV | 0 |
| ascent | FloatV | 0 |
| descent | FloatV | 0 |
| rotation | FloatV | 0 |
| string | StrV | "defaultText" |
| visibility | StrV | "" |
| fontFamily | StrV | "sans-serif" |
| fontSize | StrV | "12px" |
| fontSizeAdjust | StrV | "" |
| fontStretch | StrV | "" |
| fontStyle | StrV | "" |
| fontVariant | StrV | "" |
| fontWeight | StrV | "" |
| lineHeight | StrV | "" |
| textAnchor | StrV | "middle" |
| alignmentBaseline | StrV | "alphabetic" |
| dominantBaseline | StrV | "alphabetic" |
| ensureOnCanvas | BoolV | true |
| center | VectorV | sampled |

---

### Random Sampling

Random-sampled values are **fixed constants** (cannot be optimized) that depend only on the current `variation` (the random seed).

```style
-- this encourage has no effect because x is a constant
scalar x = random(0,100)
encourage x == 50
```

Randomly-sampled values CAN define other quantities which CAN be optimized:

```style
scalar L = random(1,2)  -- fixed random length
scalar θ = ?            -- optimizable angle
vec2 v = L * ( cos(θ), sin(θ) )
encourage norm( v - p ) == 0
```

#### Random Sampling Functions

- `random(minVal, maxVal)` — uniform sample from `[minVal, maxVal)`
- `unitRandom()` — uniform from `[0, 1)`
- `normalRandom()` — normal distribution (mean 0, std dev 1)
- `diskRandom()` — uniform point from unit disk
- `sphereRandom()` — uniform point from unit sphere
- `triangleRandom(a, b, c)` — uniform point from triangle with vertices `a`, `b`, `c`

See the [function library](https://penrose.cs.cmu.edu/docs/ref/style/functions) for more.

---

### Passthrough SVG

An escape hatch for specifying SVG properties that Penrose doesn't currently support. Write SVG properties directly as shape properties. Since the Style language doesn't allow dashes in property names, remove dashes and capitalize the next character:

- `color-interpolation` → `colorInterpolation`
- `color-interpolation-filters` → `colorInterpolationFilters`

See all SVG properties at [W3C's SVG website](https://www.w3.org/Graphics/SVG/).

**Strict Typing:** Passthrough values must be `StrV` or `FloatV`.

**Cautions:**
- Passthrough values are passed as-is — Penrose does not optimize them.
- If Penrose already writes to an SVG property, it overrides the passthrough value.
- You are responsible for ensuring the SVG property is valid for the shape type.

---

### Interactivity (experimental)

The editor supports two forms of interactivity:

#### Edit Mode

Enable in `Settings → Interactive Mode → Edit Mode`.

- Shapes become **selectable**.
- Drag to **translate**; drag resize handles to **scale**.
- Translated/scaled shapes become **pinned** (red bounding box). Right-click to manually pin/unpin.

For a shape to be translatable, both center coordinates must be sampled (`?`):
```style
c1 = Circle {}          -- translatable (center sampled by default)
c2 = Circle { center: (?, ?) }  -- translatable
c3 = Circle { center: (?, 0) }  -- NOT translatable (y is fixed)
```

For `Line` shapes: all coordinates of `start` and `end` must be sampled. For `Polygon`/`Polyline`: all coordinates of all points must be sampled. `Path` and `Group` shapes are not interactive.

#### Play Mode

Enable in `Settings → Interactive Mode → Play Mode`. Shapes with a `draggingConstraint` attribute become draggable:

```style
c1 = Circle {
    -- draggable anywhere
    draggingConstraint: "return [x, y]";
}

c2 = Circle {
    -- draggable only in the top-right quadrant
    draggingConstraint: "return [Math.max(0, x), Math.max(0, y)]";
}
```

`draggingConstraint` is the body of a JavaScript function taking mouse `x` and `y`, returning the desired position.

---

## JavaScript / TypeScript Integration

### The Language API

`@penrose/core` provides convenience functions for web application integration.

**Install:**
```shell
npm i @penrose/core
```

#### Example

```javascript
import { compile, optimize, toSVG, showError } from "@penrose/core";
import trio from "./trio.js";

const compiled = await compile(trio);
if (compiled.isErr()) {
  throw new Error(showError(compiled.error));
}
const converged = optimize(compiled.value);
if (converged.isErr()) {
  throw new Error(showError(converged.error));
}
const rendered = await toSVG(converged.value, async () => undefined);
document.getElementById("diagram").appendChild(rendered);
```

#### Reference

**`PenroseState`** — holds all data for a compiled Penrose diagram. Pass to `step`, `stepTimes`, or `optimize`, or display via `toSVG`.

**`diagram`** — convenience function encapsulating `PenroseState` usage:

```javascript
import { fetchResolver } from "@penrose/components";
import { diagram } from "@penrose/core";
import trio from "./trio.js";

await diagram(trio, document.getElementById("diagram"), fetchResolver);
```

**`compile(trio)`** — takes a Penrose trio, returns `Promise<Result<PenroseState, PenroseError>>`.

**`optimize(state)`** — fully optimizes a `PenroseState`, returns `Result<PenroseState, PenroseError>`.

**`step(state, options)`** — optimizes until the `until` callback returns `false`:

```javascript
const stepMillis = (state, millis) => {
  let elapsed = false;
  setTimeout(() => { elapsed = true; }, millis);
  return step(state, { until: () => elapsed });
};
```

**`stepTimes(state, options)`** — same as `step`.

**`isOptimized(state)`** — returns `true` if layout is fully optimized.

**`PenroseError`** — error type returned from Penrose. Use `showError` to consume it.

**`showError(error)`** — converts a `PenroseError` to a string.

**`toSVG(state, resolver)`** — renders a `PenroseState` as an `SVGSVGElement`.

**SemVer note:** Breaking changes to the public API require a major version bump.

---

### Using Penrose with Vanilla JS

`@penrose/core` is an [ECMAScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). Use a CDN with ESM support:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Penrose Vanilla JS Demo</title>
    <script type="importmap">
      {
        "imports": {
          "@penrose/core": "https://ga.jspm.io/npm:@penrose/core@3.2.0/dist/index.js"
        },
        "scopes": {
          "https://ga.jspm.io/": {
            "@penrose/optimizer": "https://ga.jspm.io/npm:@penrose/optimizer@3.2.0/dist/index.js",
            ...
          }
        }
      }
    </script>
    <script async src="https://ga.jspm.io/npm:es-module-shims@1.7.3/dist/es-module-shims.js"></script>
    <script type="module">
      import { compile, optimize, toSVG, showError } from "@penrose/core";
      const trio = {
        substance: `Set A\nLabel A $e=mc^2$`,
        style: `canvas { width = 150\nheight = 150 }\nforall Set A { Circle { center: (0,0)\nr: 50 } }`,
        domain: `type Set`,
        variation: `test`,
      };
      const compiled = await compile(trio);
      if (compiled.isErr()) console.error(showError(compiled.error));
      const optimized = optimize(compiled.value);
      if (optimized.isErr()) console.error(showError(optimized.error));
      document.getElementById("penrose").appendChild(await toSVG(optimized.value));
    </script>
  </head>
  <body>
    <div id="penrose"></div>
  </body>
</html>
```

Run with: `npx http-server .`

See the live demo at https://penrose.cs.cmu.edu/vanilla-js-demo.html.

#### Experimental Bundled ESM

Available as of v3.2.0 — all dependencies in one module:

```typescript
import { compile, optimize } from "@penrose/core/bundle";
// Check functions are loaded before using (IIFE limitation):
if (compile && optimize) {
  // use them
}
```

---

### Using Penrose with a Bundler

```shell
npm i @penrose/core
```

> **Node.js:** `core` has browser-only dependencies. Use `global-jsdom`:
> ```typescript
> import "global-jsdom/register"; // must come before Penrose import
> import * as Penrose from "@penrose/core";
> ```

**Vite setup:**
```shell
yarn create vite
cd vite-project
yarn add @penrose/core
```

`index.html`:
```html
<!doctype html>
<html>
  <body>
    <div id="penrose-diagram"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

`main.js`:
```javascript
import * as Penrose from "@penrose/core";
Penrose.diagram(
  {
    substance: `Set A, B\nSubset(A, B)`,
    style: `canvas { width = 400\nheight = 400 }\nforall Set s { s.shape = Circle {}\nensure lessThan(20, s.shape.r) }\nforall Set s1, s2 where Subset(s1, s2) { ensure contains(s2.shape, s1.shape)\ns2.shape above s1.shape }`,
    domain: `type Set\npredicate Subset(Set, Set)`,
    variation: "",
  },
  document.getElementById("penrose-diagram"),
  async () => undefined,
);
```

```shell
yarn dev
```

---

### Using Penrose with React

```shell
npm i @penrose/components
npm i react react-dom
```

```typescript
import { Embed } from "@penrose/components";

const domain = `type Set`;

const substance = `
Set A
AutoLabel All
`;

const style = `
canvas {
  width = 500
  height = 500
}
forall Set X {
  X.shape = Circle { }
  X.text  = Text { string: X.label }
  ensure contains(X.shape, X.text)
}
`;

const App = () => (
  <Embed domain={domain} substance={substance} style={style} variation={""} />
);

export default App;
```

Full list of exported components and examples: https://penrose.github.io/penrose/storybook/

---

## Writing Constraints & Objectives

### Diagramming from a Technical Perspective

Making a diagram can be encoded as an **optimization problem**. Penrose uses **numerical optimization** with energy functions to quantify diagram quality. Lower energy = better diagram.

Three energy levels:
- **Global minimum** — perfect diagram, cannot be locally improved.
- **Local minima** — "pretty good" diagram.
- **Maxima** — bad diagram.

Penrose uses **autodiff** (automatic differentiation) to compute gradients ∇Φ of the energy function Φ and find local minima. Constraints and objectives are implemented as energy functions written in TypeScript using autodiff helper functions.

### How to Come Up With Constraints

Think mathematically about what the relationship means. Example — circle containment:

Circle A is contained in circle B if and only if: $r_B > d + r_A$, where $d$ is the distance between centers.

Rearranged as zero-based energy expression: $d - (r_B - r_A) < 0$.

### How to Write Constraints (Concrete)

**1. The autodiff code is TypeScript.**

**2. Autodiff functions** replace native TypeScript operators:
- `add(a, b)` instead of `a + b`
- `sub(a, b)` instead of `a - b`
- `mul(a, b)` instead of `a * b`
- `inverse(v)` for `1/v`
- Composite operations via `ops.<function-name>` (e.g. `ops.dist(A, B)`, `ops.vdistsq(v, w)`)

**3. Special number types:** All numbers must be type `Num`. Any `number` is automatically a `Num`.

**4. Zero-based inequality to energy function:**
- Translate constraint $f(x) \le c$ to zero-based inequality $f(x) - c \le 0$.
- Energy = $f(x) - c$. Positive means constraint violated; more positive = more violated.

**5. Negative outputs** mean the constraint is satisfied.

**6. Accessing shape fields:** `shapeName.propertyName.contents` returns a `Num`.
- Example: `c.r.contents` gives the radius of circle `c`.

### Objectives Example: Circle Repel

Unlike constraints (binary satisfied/unsatisfied), objectives output "badness" with local minima where we want the solution.

```typescript
const repel = (s1: Circle<Num>, s2: Circle<Num>, weight: Num = 10e6) => {
  const epsDenom = 10e-6;
  const res = inverse(
    add(ops.vdistsq(s1.center.contents, s2.center.contents), epsDenom),
  );
  return mul(res, weight);
};
```

This returns $\frac{10^6}{d^2}$ — as circles move closer ($d$ decreases), energy increases, encouraging them to stay apart.

### Exercise: Disjoint Circles

```typescript
/* d(c1, c2) >= r1 + r2 (circles don't overlap) */
const disjoint = (s1: Circle<Num>, s2: Circle<Num>) => {
  const res = add(s1.r.contents, s2.r.contents);
  return sub(res, ops.vdist(s1.center.contents, s2.center.contents));
};

/* d(c1, c2) >= r1 + r2 + padding */
const disjointPadding = (s1: Circle<Num>, s2: Circle<Num>, padding: Num) => {
  const res = add(add(s1.r.contents, s2.r.contents), padding);
  return sub(res, ops.vdist(s1.center.contents, s2.center.contents));
};
```

### Key Takeaways

- Diagramming = optimization problem → Penrose uses numerical optimization.
- Constraints and objectives = energy functions. Lower energy = better diagram.
- Write energy functions using autodiff functions with `Num` types.
- Constraints: energy ≤ 0 means satisfied; > 0 means violated.
- Objectives: output "badness" with a local minimum at the desired configuration.

---

## The Optimization API

Source: https://penrose.cs.cmu.edu/docs/ref/optimization-api

The Optimization API exposes low-level functionality to construct and solve optimization problems independently of the Language API. Import from `@penrose/core`.

### `variable(val)`

Creates a variable in an optimization problem — a number the optimizer can change. Takes an initial value `val: number`.

### `problem({ constraints?, objective? })`

Sets up an optimization problem. Call `.start()` before running.

`.start()` returns:
- `run(options?)` — runs the optimizer (optional `until` stopping condition).
- `converged` — boolean indicating whether optimizer converged.

**Example:** Minimize x such that (x − 5)² = 0, starting at x = 10:

```typescript
import { variable, pow, sub, problem } from "@penrose/core";

const x = variable(10);
const p = await problem({ constraints: [pow(sub(x, 5), 2)] });
const { vals } = p.start({}).run({});
console.log(p.converged); // true
console.log(x);           // a value closer to 5
```

### Arithmetic functions

All autodiff arithmetic functions (`add`, `sub`, `mul`, `pow`, etc.) from `@penrose/core` are available. See the [Writing Constraints & Objectives](#writing-constraints--objectives) section for usage details.

> **Note:** The "All the arithmetic functions" section of the live docs is marked "Coming soon!" as of April 2026.

---

## Using Penrose with SolidJS

Source: https://penrose.cs.cmu.edu/docs/ref/solid

> **Note:** Official documentation is not yet available. See the [experimental SolidJS packages in the Penrose repository](https://github.com/penrose/penrose/tree/main/packages/solids).

---

## Additional Resources

| Resource | URL |
|----------|-----|
| Online Editor | https://penrose.cs.cmu.edu/try/index.html |
| Examples / Gallery | https://penrose.cs.cmu.edu/examples |
| Function Library | https://penrose.cs.cmu.edu/docs/ref/style/functions |
| Optimization API | https://penrose.cs.cmu.edu/docs/ref/optimization-api |
| Using with SolidJS | https://penrose.cs.cmu.edu/docs/ref/solid (docs not yet published) |
| Bloom (interactive JS) | https://penrose.cs.cmu.edu/docs/bloom/tutorial/getting_started |
| Bloom API Reference | https://penrose.cs.cmu.edu/bloom-docs/index.html |
| GitHub Repository | https://github.com/penrose/penrose |
| Discord | https://discord.gg/a7VXJU4dfR |
| npm (@penrose/core) | https://www.npmjs.com/package/@penrose/core |
| npm (@penrose/components) | https://www.npmjs.com/package/@penrose/components |
| React Storybook | https://penrose.github.io/penrose/storybook/ |
| CHANGELOG | https://github.com/penrose/penrose/blob/main/CHANGELOG.md |
