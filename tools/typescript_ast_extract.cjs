"use strict";

// Bridge used by architecture_ast_graph.py. TypeScript parsing stays on the
// compiler's real syntax tree while Python handles graph assembly/rendering.
const fs = require("node:fs");
const compilerPath = process.argv[2];
if (!compilerPath) throw new Error("expected path to typescript.js");
const ts = require(compilerPath);
const request = JSON.parse(fs.readFileSync(0, "utf8"));

function hasModifier(node, kind) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === kind));
}

function propertyName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) return node.text;
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return null;
}

function dottedName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) return node.text;
  if (node.kind === ts.SyntaxKind.ThisKeyword) return "this";
  if (ts.isPropertyAccessExpression(node)) {
    const parent = dottedName(node.expression);
    return parent ? `${parent}.${node.name.text}` : node.name.text;
  }
  if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)) {
    const parent = dottedName(node.expression);
    return parent ? `${parent}.${node.argumentExpression.text}` : node.argumentExpression.text;
  }
  return null;
}

function callsWithin(node) {
  const calls = [];
  function visit(child) {
    if (ts.isCallExpression(child) || ts.isNewExpression(child)) {
      const name = dottedName(child.expression);
      if (name) calls.push(name);
    }
    ts.forEachChild(child, visit);
  }
  ts.forEachChild(node, visit);
  return calls;
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function definition(sourceFile, node, kind, name, owner = null) {
  return {
    kind,
    name: owner ? `${owner}.${name}` : name,
    owner,
    line: lineOf(sourceFile, node),
    calls: kind === "class" || kind === "type" ? [] : callsWithin(node),
  };
}

function parseFile(item) {
  const text = fs.readFileSync(item.path, "utf8");
  const scriptKind = item.path.toLowerCase().endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(item.relativePath, text, ts.ScriptTarget.Latest, true, scriptKind);
  const imports = [];
  const definitions = [];
  let defaultExport = null;

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const aliases = {};
      const clause = statement.importClause;
      if (clause?.name) aliases[clause.name.text] = "default";
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        aliases[clause.namedBindings.name.text] = "*";
      } else if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          aliases[element.name.text] = element.propertyName?.text ?? element.name.text;
        }
      }
      imports.push({ source: statement.moduleSpecifier.text, aliases });
      continue;
    }
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      imports.push({ source: statement.moduleSpecifier.text, aliases: {} });
      continue;
    }
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      definitions.push(definition(sourceFile, statement, "function", statement.name.text));
      if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) defaultExport = statement.name.text;
      continue;
    }
    if (ts.isClassDeclaration(statement) && statement.name) {
      const className = statement.name.text;
      definitions.push(definition(sourceFile, statement, "class", className));
      for (const member of statement.members) {
        if (ts.isMethodDeclaration(member) || ts.isGetAccessorDeclaration(member) ||
            ts.isSetAccessorDeclaration(member) || ts.isConstructorDeclaration(member)) {
          const methodName = ts.isConstructorDeclaration(member) ? "constructor" : propertyName(member.name);
          if (methodName) definitions.push(definition(sourceFile, member, "function", methodName, className));
        }
      }
      if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) defaultExport = className;
      continue;
    }
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) {
      definitions.push(definition(sourceFile, statement, "type", statement.name.text));
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const name = declaration.name.text;
        const isFunction = declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer));
        definitions.push(definition(sourceFile, declaration, isFunction ? "function" : "value", name));
      }
      continue;
    }
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression)) {
      defaultExport = statement.expression.text;
    }
  }
  return {
    relativePath: item.relativePath,
    imports,
    definitions,
    defaultExport,
    diagnostics: sourceFile.parseDiagnostics.map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");
      const line = diagnostic.start === undefined ? 0 :
        sourceFile.getLineAndCharacterOfPosition(diagnostic.start).line + 1;
      return `${item.relativePath}:${line}: ${message}`;
    }),
  };
}

process.stdout.write(JSON.stringify(request.files.map(parseFile)));
