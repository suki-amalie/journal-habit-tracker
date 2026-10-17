# Architecture mapper

`architecture_ast_graph.py` statically maps Hibi Notes without importing or
executing application modules. Python source is parsed with the standard
library `ast` module; TypeScript and TSX source is parsed with the TypeScript
compiler already installed under `client/node_modules`. It records:

- modules and their source paths;
- top-level classes, functions, interfaces, types, enums, and values;
- methods contained by classes;
- internal and external imports; and
- statically resolvable calls between project symbols.

It uses Python's standard `ast` library and invokes a local Graphviz `dot`
executable only for SVG rendering.

## Run

From the repository root (after `npm install` in `client`):

```powershell
python tools\architecture_ast_graph.py
```

The default outputs are:

- `artifacts\architecture\journal_habit_tracker_codebase.dot`
- `artifacts\architecture\journal_habit_tracker_codebase.svg`

If Graphviz is not on `PATH`, either set `GRAPHVIZ_DOT` or provide its location:

```powershell
python tools\architecture_ast_graph.py --dot-executable "C:\Program Files\Graphviz\bin\dot.exe"
```

Useful options:

```powershell
python tools\architecture_ast_graph.py C:\path\to\project `
  --output-base C:\path\to\output\architecture `
  --exclude generated `
  --title "Project Source Architecture"
```

Use `--dot-only` when the portable DOT source is needed without rendering.
Use `--typescript-library` to point to `typescript.js` when it is installed in
a non-standard location.

## Scope

This is a static source map. Dynamic imports, reflection, dependency injection,
runtime configuration choices, HTTP relationships, database relationships, and
calls that cannot be resolved from names in the syntax tree are intentionally
not inferred.
