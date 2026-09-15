const { parse } = require("@babel/parser");

const PREVIEW_COMPONENT_ERROR =
  "Add a default export or define a top-level PascalCase function, class, or component variable to preview.";

function parseModule(source) {
  return parse(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript", "decorators-legacy"]
  });
}

function isComponentName(name) {
  return /^[A-Z][A-Za-z0-9_$]*$/.test(name);
}

function isComponentFactoryCall(node) {
  if (!node || node.type !== "CallExpression") return false;

  const callee = node.callee;
  if (callee.type === "Identifier") {
    return ["memo", "forwardRef", "lazy"].includes(callee.name);
  }

  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier" &&
    ["memo", "forwardRef", "lazy"].includes(callee.property.name)
  );
}

function isComponentVariable(node) {
  if (!node) return false;

  if (node.type === "ClassExpression") {
    return isReactComponentClass(node);
  }

  return (
    ((node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionExpression") &&
      !node.async &&
      !node.generator) ||
    isComponentFactoryCall(node)
  );
}

function isReactComponentClass(node) {
  const parent = node.superClass;
  if (!parent) return false;

  if (parent.type === "Identifier") {
    return parent.name === "Component" || parent.name === "PureComponent";
  }

  return (
    parent.type === "MemberExpression" &&
    !parent.computed &&
    parent.property.type === "Identifier" &&
    (parent.property.name === "Component" ||
      parent.property.name === "PureComponent")
  );
}

function unwrapNamedExport(node) {
  return node.type === "ExportNamedDeclaration" && node.declaration
    ? node.declaration
    : node;
}

function getPreviewCandidates(program) {
  const candidates = [];

  for (const statement of program.body) {
    const node = unwrapNamedExport(statement);

    if (
      node.type === "FunctionDeclaration" &&
      node.id &&
      !node.async &&
      !node.generator &&
      isComponentName(node.id.name)
    ) {
      candidates.push(node.id.name);
      continue;
    }

    if (
      node.type === "ClassDeclaration" &&
      node.id &&
      isComponentName(node.id.name) &&
      isReactComponentClass(node)
    ) {
      candidates.push(node.id.name);
      continue;
    }

    if (node.type === "VariableDeclaration") {
      for (const declaration of node.declarations) {
        if (
          declaration.id.type === "Identifier" &&
          isComponentName(declaration.id.name) &&
          isComponentVariable(declaration.init)
        ) {
          candidates.push(declaration.id.name);
        }
      }
    }
  }

  return [...new Set(candidates)];
}

function getPreferredCandidate(candidates) {
  for (const preferred of ["App", "Preview", "Component"]) {
    if (candidates.includes(preferred)) return preferred;
  }

  return candidates[0] || null;
}

function hasDefaultExport(program) {
  return program.body.some(
    node =>
      node.type === "ExportDefaultDeclaration" ||
      (node.type === "ExportNamedDeclaration" &&
        node.specifiers.some(
          specifier =>
            specifier.exported &&
            ((specifier.exported.type === "Identifier" &&
              specifier.exported.name === "default") ||
              (specifier.exported.type === "StringLiteral" &&
                specifier.exported.value === "default"))
        ))
  );
}

function hasReactImport(program) {
  return program.body.some(
    node => node.type === "ImportDeclaration" && node.source.value === "react"
  );
}

function getBareJsx(program) {
  if (program.body.length !== 1) return null;
  const statement = program.body[0];

  return statement.type === "ExpressionStatement" &&
    (statement.expression.type === "JSXElement" ||
      statement.expression.type === "JSXFragment")
    ? statement.expression
    : null;
}

function buildPreviewNotice(message) {
  return `import * as React from "react";

export default function FolioifyPreviewNotice() {
  return (
    <div role="alert" style={{ fontFamily: "sans-serif", padding: 24, color: "#991b1b" }}>
      <strong>Preview unavailable.</strong>
      <p>{${JSON.stringify(message)}}</p>
    </div>
  );
}`;
}

function formatParseError(error) {
  if (!(error instanceof Error)) {
    return "Fix the JSX or TSX syntax before previewing.";
  }

  const location = error.loc
    ? ` at line ${error.loc.line}, column ${error.loc.column + 1}`
    : "";
  const detail = error.message.replace(/\s*\(\d+:\d+\)$/, "");
  return `Fix the JSX or TSX syntax${location}: ${detail}`;
}

function preparePreviewSource(source) {
  const trimmed = source.trim();
  if (!trimmed) {
    return {
      code: buildPreviewNotice(PREVIEW_COMPONENT_ERROR),
      error: PREVIEW_COMPONENT_ERROR
    };
  }

  let ast;
  try {
    ast = parseModule(source);
  } catch (error) {
    const message = formatParseError(error);
    return {
      code: buildPreviewNotice(message),
      error: message
    };
  }

  const bareJsx = getBareJsx(ast.program);
  if (bareJsx) {
    const bareJsxSource = source.slice(bareJsx.start, bareJsx.end);
    return {
      code: `import * as React from "react";\nconst App = () => (${bareJsxSource});\n\nexport default App;`,
      error: null
    };
  }

  const parts = [];
  if (!hasReactImport(ast.program)) {
    parts.push(`import * as React from "react";`);
  }
  parts.push(source);

  if (hasDefaultExport(ast.program)) {
    return { code: parts.join("\n"), error: null };
  }

  const candidate = getPreferredCandidate(getPreviewCandidates(ast.program));
  if (!candidate) {
    return {
      code: buildPreviewNotice(PREVIEW_COMPONENT_ERROR),
      error: PREVIEW_COMPONENT_ERROR
    };
  }

  parts.push(`\nexport default ${candidate};`);
  return { code: parts.join("\n"), error: null };
}

module.exports = {
  preparePreviewSource
};
