"""Build a static Python/TypeScript architecture map and render it with Graphviz.

Python files use the standard-library :mod:`ast` module. TypeScript and TSX use
the project's installed TypeScript compiler through ``typescript_ast_extract.cjs``.
Application modules are never imported or executed.
"""

from __future__ import annotations

import argparse
import ast
from dataclasses import dataclass, field
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from typing import Iterator, Sequence


DEFAULT_EXCLUDES = {
    ".git", ".mypy_cache", ".pytest_cache", ".ruff_cache", ".venv", ".vs",
    "__pycache__", "artifacts", "build", "dist", "node_modules", "tools", "venv",
}
SOURCE_SUFFIXES = {".py", ".ts", ".tsx"}
NODE_COLORS = {
    "module": ("#001200", "#33FF33", "#007700"),
    "class": ("#000018", "#6699FF", "#0033CC"),
    "function": ("#181000", "#FFD54F", "#CC8800"),
    "type": ("#120018", "#D18CFF", "#7D2EAA"),
    "value": ("#001818", "#65E6E6", "#168A8A"),
    "external": ("#180000", "#FF6666", "#CC0000"),
}


@dataclass(frozen=True, order=True)
class GraphNode:
    node_id: str
    kind: str
    label: str
    module: str = ""
    detail: str = ""
    relative_path: str = ""
    line: int = 0


@dataclass(frozen=True, order=True)
class GraphEdge:
    source: str
    target: str
    kind: str
    label: str


@dataclass(frozen=True)
class Definition:
    kind: str
    name: str
    owner: str | None
    line: int
    calls: tuple[str, ...] = ()


@dataclass(frozen=True)
class ImportRecord:
    source: str
    aliases: dict[str, str]
    relative: bool = False


@dataclass
class ModuleRecord:
    name: str
    path: Path
    relative_path: str
    language: str
    definitions: list[Definition] = field(default_factory=list)
    imports: list[ImportRecord] = field(default_factory=list)
    default_export: str | None = None


@dataclass
class ArchitectureMap:
    root: Path
    nodes: dict[str, GraphNode] = field(default_factory=dict)
    edges: set[GraphEdge] = field(default_factory=set)
    warnings: list[str] = field(default_factory=list)

    def add_node(self, node: GraphNode) -> None:
        self.nodes[node.node_id] = node

    def add_edge(self, source: str, target: str, kind: str, label: str) -> None:
        if source != target:
            self.edges.add(GraphEdge(source, target, kind, label))


def _module_name(root: Path, path: Path) -> str:
    parts = list(path.relative_to(root).with_suffix("").parts)
    if path.suffix == ".py" and parts[-1] == "__init__":
        parts.pop()
    return ".".join(parts) or root.name


def discover_source_files(root: Path, excludes: set[str]) -> Iterator[Path]:
    """Yield supported source files beneath *root* in stable order."""
    candidates = []
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in SOURCE_SUFFIXES:
            continue
        if path.name.endswith(".d.ts"):
            continue
        if any(part in excludes for part in path.relative_to(root).parts[:-1]):
            continue
        candidates.append(path)
    yield from sorted(candidates, key=lambda item: item.as_posix().casefold())


def _dotted_python_name(node: ast.AST) -> str | None:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        parent = _dotted_python_name(node.value)
        return f"{parent}.{node.attr}" if parent else node.attr
    return None


def _python_calls(node: ast.AST) -> tuple[str, ...]:
    calls = []
    for child in ast.walk(node):
        if isinstance(child, ast.Call) and (name := _dotted_python_name(child.func)):
            calls.append(name)
    return tuple(calls)


def _resolve_python_from(module: str, is_package: bool, node: ast.ImportFrom) -> str:
    if node.level == 0:
        return node.module or ""
    package = module.split(".") if is_package else module.split(".")[:-1]
    climb = max(0, node.level - 1)
    if climb:
        package = package[:-climb] if climb <= len(package) else []
    if node.module:
        package.extend(node.module.split("."))
    return ".".join(package)


def parse_python(path: Path, root: Path) -> tuple[ModuleRecord | None, list[str]]:
    relative_path = path.relative_to(root).as_posix()
    try:
        tree = ast.parse(path.read_text(encoding="utf-8-sig"), filename=relative_path)
    except (OSError, UnicodeError, SyntaxError) as exc:
        return None, [f"Skipped {relative_path}: {exc}"]
    module = _module_name(root, path)
    record = ModuleRecord(module, path, relative_path, "Python")
    for statement in tree.body:
        if isinstance(statement, ast.ClassDef):
            record.definitions.append(Definition("class", statement.name, None, statement.lineno))
            for member in statement.body:
                if isinstance(member, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    record.definitions.append(Definition(
                        "function", f"{statement.name}.{member.name}", statement.name,
                        member.lineno, _python_calls(member),
                    ))
        elif isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef)):
            record.definitions.append(Definition(
                "function", statement.name, None, statement.lineno, _python_calls(statement),
            ))
        elif isinstance(statement, ast.Import):
            for alias in statement.names:
                local = alias.asname or alias.name.split(".")[0]
                record.imports.append(ImportRecord(alias.name, {local: "*"}))
        elif isinstance(statement, ast.ImportFrom):
            source = _resolve_python_from(module, path.name == "__init__.py", statement)
            aliases = {alias.asname or alias.name: alias.name for alias in statement.names if alias.name != "*"}
            record.imports.append(ImportRecord(source, aliases))
    return record, []


def find_typescript_library(root: Path, explicit: Path | None) -> Path | None:
    candidates = []
    if explicit:
        candidates.append(explicit)
    candidates.extend([
        root / "client/node_modules/typescript/lib/typescript.js",
        root / "server/node_modules/typescript/lib/typescript.js",
        root / "node_modules/typescript/lib/typescript.js",
    ])
    return next((candidate.resolve() for candidate in candidates if candidate.is_file()), None)


def parse_typescript(paths: list[Path], root: Path, compiler: Path, bridge: Path) -> tuple[list[ModuleRecord], list[str]]:
    if not paths:
        return [], []
    node = shutil.which("node")
    if node is None:
        return [], ["Skipped TypeScript/TSX files: Node.js was not found on PATH"]
    request = {"files": [
        {"path": str(path), "relativePath": path.relative_to(root).as_posix()} for path in paths
    ]}
    completed = subprocess.run(
        [node, str(bridge), str(compiler)], input=json.dumps(request),
        capture_output=True, text=True, check=False,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip() or "unknown error"
        return [], [f"Skipped TypeScript/TSX files: compiler bridge failed: {detail}"]
    try:
        payload = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        return [], [f"Skipped TypeScript/TSX files: invalid compiler bridge output: {exc}"]
    by_relative = {path.relative_to(root).as_posix(): path for path in paths}
    records = []
    warnings = []
    for item in payload:
        relative_path = item["relativePath"]
        path = by_relative[relative_path]
        record = ModuleRecord(
            _module_name(root, path), path, relative_path, "TypeScript",
            default_export=item.get("defaultExport"),
        )
        record.definitions.extend(Definition(
            entry["kind"], entry["name"], entry.get("owner"), entry["line"],
            tuple(entry.get("calls", [])),
        ) for entry in item["definitions"])
        record.imports.extend(ImportRecord(
            entry["source"], entry.get("aliases", {}), entry["source"].startswith("."),
        ) for entry in item["imports"])
        warnings.extend(f"TypeScript parse diagnostic: {message}" for message in item["diagnostics"])
        records.append(record)
    return records, warnings


def parse_modules(root: Path, excludes: set[str], typescript_library: Path | None) -> tuple[list[ModuleRecord], list[str]]:
    records = []
    warnings = []
    typescript_paths = []
    for path in discover_source_files(root, excludes):
        if path.suffix == ".py":
            record, messages = parse_python(path, root)
            if record:
                records.append(record)
            warnings.extend(messages)
        else:
            typescript_paths.append(path)
    if typescript_paths:
        if typescript_library is None:
            warnings.append("Skipped TypeScript/TSX files: typescript.js was not found; run npm install or pass --typescript-library")
        else:
            bridge = Path(__file__).with_name("typescript_ast_extract.cjs")
            ts_records, messages = parse_typescript(typescript_paths, root, typescript_library, bridge)
            records.extend(ts_records)
            warnings.extend(messages)
    return records, warnings


def _symbol_id(module: str, qualified_name: str) -> str:
    return f"symbol:{module}:{qualified_name}"


def _module_id(module: str) -> str:
    return f"module:{module}"


def _external_id(package: str) -> str:
    return f"external:{package}"


def _external_package(source: str) -> str:
    parts = source.split("/")
    return "/".join(parts[:2]) if source.startswith("@") else parts[0]


def _resolve_module(record: ModuleRecord, source: str, records_by_name: dict[str, ModuleRecord], records_by_stem: dict[Path, ModuleRecord]) -> ModuleRecord | None:
    if not source.startswith("."):
        return records_by_name.get(source)
    raw = record.path.parent / source
    if raw.suffix.lower() in {".js", ".jsx", ".ts", ".tsx", ".py"}:
        raw = raw.with_suffix("")
    candidates = [raw.resolve(), (raw / "index").resolve(), (raw / "__init__").resolve()]
    return next((records_by_stem[candidate] for candidate in candidates if candidate in records_by_stem), None)


def build_architecture_map(root: Path, excludes: set[str], typescript_library: Path | None) -> ArchitectureMap:
    """Parse *root* and return a static module, symbol, import, and call map."""
    root = root.resolve()
    records, warnings = parse_modules(root, excludes, typescript_library)
    result = ArchitectureMap(root=root, warnings=warnings)
    records_by_name = {record.name: record for record in records}
    records_by_stem = {record.path.with_suffix("").resolve(): record for record in records}
    symbols_by_module: dict[str, dict[str, str]] = {}
    for record in records:
        result.add_node(GraphNode(
            _module_id(record.name), "module", record.name, record.name,
            f"{record.language} | {record.relative_path}", record.relative_path,
        ))
        module_symbols = symbols_by_module.setdefault(record.name, {})
        for definition in record.definitions:
            node_id = _symbol_id(record.name, definition.name)
            module_symbols[definition.name] = node_id
            result.add_node(GraphNode(
                node_id, definition.kind, definition.name, record.name,
                f"line {definition.line}", record.relative_path, definition.line,
            ))
            container = _symbol_id(record.name, definition.owner) if definition.owner else _module_id(record.name)
            result.add_edge(container, node_id, "contains", "contains")

    aliases_by_module: dict[str, dict[str, tuple[ModuleRecord, str]]] = {}
    for record in records:
        aliases = aliases_by_module.setdefault(record.name, {})
        for imported in record.imports:
            target_record = _resolve_module(record, imported.source, records_by_name, records_by_stem)
            if target_record:
                result.add_edge(_module_id(record.name), _module_id(target_record.name), "import", "imports")
                for local, imported_name in imported.aliases.items():
                    aliases[local] = (target_record, imported_name)
            elif not imported.relative:
                package = _external_package(imported.source)
                target = _external_id(package)
                result.add_node(GraphNode(target, "external", package))
                result.add_edge(_module_id(record.name), target, "import", "imports")
            elif Path(imported.source).suffix.lower() in {"", ".js", ".jsx", ".ts", ".tsx", ".py"}:
                result.warnings.append(f"Unresolved internal import in {record.relative_path}: {imported.source}")

    for record in records:
        local_symbols = symbols_by_module[record.name]
        aliases = aliases_by_module[record.name]
        for definition in record.definitions:
            caller = local_symbols[definition.name]
            for call_name in definition.calls:
                target = None
                if call_name.startswith(("self.", "cls.", "this.")) and definition.owner:
                    target = local_symbols.get(f"{definition.owner}.{call_name.split('.', 1)[1]}")
                elif call_name in local_symbols:
                    target = local_symbols[call_name]
                else:
                    first, _, remainder = call_name.partition(".")
                    if binding := aliases.get(first):
                        target_record, imported_name = binding
                        target_name = imported_name
                        if imported_name == "default":
                            target_name = target_record.default_export or first
                        elif imported_name == "*":
                            target_name = remainder
                        elif remainder:
                            target_name = f"{imported_name}.{remainder}"
                        target = symbols_by_module[target_record.name].get(target_name)
                if target:
                    result.add_edge(caller, target, "call", "calls")
    return result


def _dot_quote(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    return f'"{escaped}"'


def to_dot(architecture: ArchitectureMap, output_directory: Path, title: str = "Hibi Notes Source Architecture") -> str:
    """Serialize an architecture map as deterministic Graphviz DOT."""
    lines = [
        "digraph architecture {", "  graph [", f"    label={_dot_quote(title)},",
        '    labelloc="t",', '    bgcolor="#000000",', '    fontcolor="#33FF33",',
        '    fontname="Consolas",', '    fontsize="20",', '    rankdir="LR",',
        '    pad="0.35",', '    nodesep="0.22",', '    ranksep="0.65",',
        '    splines="spline"', "  ];",
        '  node [fontname="Consolas", fontsize="10", shape="box", style="filled,rounded"];',
        '  edge [fontname="Consolas", fontsize="8", arrowsize="0.65"];',
    ]
    identifiers = {node.node_id: f"n{index}" for index, node in enumerate(sorted(architecture.nodes.values()), start=1)}
    for node in sorted(architecture.nodes.values()):
        fill, font, border = NODE_COLORS[node.kind]
        label = node.label if not node.detail else f"{node.label}\n{node.detail}"
        shape = {"module": "component", "class": "folder", "type": "hexagon", "external": "ellipse"}.get(node.kind, "box")
        attributes = [
            f"label={_dot_quote(label)}", f'fillcolor="{fill}"', f'fontcolor="{font}"',
            f'color="{border}"', f'shape="{shape}"',
        ]
        if node.relative_path:
            source = architecture.root / node.relative_path
            link = os.path.relpath(source, output_directory).replace("\\", "/")
            tooltip = f"{node.relative_path}:{node.line}" if node.line else node.relative_path
            attributes.extend([f"URL={_dot_quote(link)}", f"tooltip={_dot_quote(tooltip)}"])
        lines.append(f"  {identifiers[node.node_id]} [{', '.join(attributes)}];")
    edge_styles = {
        "contains": ('"#004400"', '"solid"'), "import": ('"#6699FF"', '"dashed"'),
        "call": ('"#FFD54F"', '"dotted"'),
    }
    for edge in sorted(architecture.edges):
        color, style = edge_styles[edge.kind]
        lines.append(f"  {identifiers[edge.source]} -> {identifiers[edge.target]} [label={_dot_quote(edge.label)}, color={color}, fontcolor={color}, style={style}];")
    lines.append("}")
    return "\n".join(lines) + "\n"


def find_graphviz_dot(explicit: Path | None = None) -> Path | None:
    """Find Graphviz's renderer without installing or downloading anything."""
    candidates = []
    if explicit:
        candidates.append(explicit)
    if environment_path := os.environ.get("GRAPHVIZ_DOT"):
        candidates.append(Path(environment_path))
    if discovered := shutil.which("dot"):
        candidates.append(Path(discovered))
    candidates.extend([
        Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Graphviz/bin/dot.exe",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Programs/Graphviz/bin/dot.exe",
    ])
    return next((candidate.resolve() for candidate in candidates if candidate.is_file()), None)


def render_svg(dot_path: Path, svg_path: Path, executable: Path) -> None:
    completed = subprocess.run(
        [str(executable), "-Tsvg", "-o", str(svg_path), str(dot_path)],
        check=False, capture_output=True, text=True,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip() or "unknown error"
        raise RuntimeError(f"Graphviz failed with exit code {completed.returncode}: {detail}")


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Map Python and TypeScript code with ASTs and render DOT plus SVG through Graphviz.")
    parser.add_argument("root", nargs="?", type=Path, default=Path.cwd(), help="codebase root")
    parser.add_argument("--output-base", type=Path, default=Path("artifacts/architecture/journal_habit_tracker_codebase"), help="output path without an extension")
    parser.add_argument("--exclude", action="append", default=[], metavar="NAME", help="additional directory name to exclude; repeat as needed")
    parser.add_argument("--title", default="Hibi Notes Source Architecture", help="graph title")
    parser.add_argument("--dot-executable", type=Path, help="path to Graphviz dot executable")
    parser.add_argument("--typescript-library", type=Path, help="path to TypeScript's lib/typescript.js")
    parser.add_argument("--dot-only", action="store_true", help="write DOT without invoking Graphviz")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    root = args.root.resolve()
    if not root.is_dir():
        print(f"error: codebase root is not a directory: {root}", file=sys.stderr)
        return 2
    output_base = args.output_base if args.output_base.is_absolute() else root / args.output_base
    output_base.parent.mkdir(parents=True, exist_ok=True)
    dot_path = output_base.with_suffix(".dot")
    svg_path = output_base.with_suffix(".svg")
    architecture = build_architecture_map(
        root, DEFAULT_EXCLUDES | set(args.exclude), find_typescript_library(root, args.typescript_library),
    )
    dot_path.write_text(to_dot(architecture, output_base.parent, args.title), encoding="utf-8", newline="\n")
    modules = sum(node.kind == "module" for node in architecture.nodes.values())
    symbols = sum(node.kind in {"class", "function", "type", "value"} for node in architecture.nodes.values())
    print(f"Mapped {modules} modules, {symbols} symbols, and {len(architecture.edges)} relationships.")
    print(f"DOT: {dot_path}")
    for warning in architecture.warnings:
        print(f"warning: {warning}", file=sys.stderr)
    if args.dot_only:
        return 0
    executable = find_graphviz_dot(args.dot_executable)
    if executable is None:
        print("error: Graphviz dot was not found. Install Graphviz, set GRAPHVIZ_DOT, or pass --dot-executable. The DOT output was preserved.", file=sys.stderr)
        return 2
    try:
        render_svg(dot_path, svg_path, executable)
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    print(f"SVG: {svg_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
