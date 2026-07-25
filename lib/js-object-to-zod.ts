import { transform } from "@babel/standalone";
import { jsonToZod } from "json-to-zod";

type JsonLiteral =
  | null
  | boolean
  | number
  | string
  | JsonLiteral[]
  | { [key: string]: JsonLiteral };

const INVALID_LITERAL_MESSAGE =
  "Input must be a JSON-compatible JavaScript object literal.";

function invalidLiteral(): never {
  throw new Error(INVALID_LITERAL_MESSAGE);
}

function readPropertyKey(node: any): string {
  if (node.type === "Identifier") return node.name;
  if (node.type === "StringLiteral") return node.value;
  if (node.type === "NumericLiteral") return String(node.value);
  return invalidLiteral();
}

function readLiteral(node: any): JsonLiteral {
  switch (node?.type) {
    case "StringLiteral":
    case "BooleanLiteral":
      return node.value;
    case "NumericLiteral":
      return Number.isFinite(node.value) ? node.value : invalidLiteral();
    case "NullLiteral":
      return null;
    case "UnaryExpression":
      if (
        (node.operator === "-" || node.operator === "+") &&
        node.argument?.type === "NumericLiteral" &&
        Number.isFinite(node.argument.value)
      ) {
        return node.operator === "-"
          ? -node.argument.value
          : node.argument.value;
      }
      return invalidLiteral();
    case "ArrayExpression":
      return node.elements.map(element =>
        element ? readLiteral(element) : invalidLiteral()
      );
    case "ObjectExpression": {
      const value: Record<string, JsonLiteral> = Object.create(null);

      for (const property of node.properties) {
        if (
          property.type !== "ObjectProperty" ||
          property.computed ||
          property.method ||
          property.shorthand
        ) {
          return invalidLiteral();
        }

        value[readPropertyKey(property.key)] = readLiteral(property.value);
      }

      return value;
    }
    default:
      return invalidLiteral();
  }
}

function parseObjectLiteral(source: string): JsonLiteral {
  let ast: any;

  try {
    ast = transform(`const value = (${source});`, {
      ast: true,
      code: false
    }).ast;
  } catch {
    return invalidLiteral();
  }

  const body = ast?.program?.body;
  const statement = body?.[0];
  const declaration = statement?.declarations?.[0];

  if (
    body?.length !== 1 ||
    statement?.type !== "VariableDeclaration" ||
    statement.declarations?.length !== 1 ||
    declaration?.id?.type !== "Identifier" ||
    declaration.id.name !== "value" ||
    declaration.init?.type !== "ObjectExpression"
  ) {
    return invalidLiteral();
  }

  return readLiteral(declaration.init);
}

export function convertJsObjectToZod(source: string, rootName: string): string {
  const normalized = JSON.parse(JSON.stringify(parseObjectLiteral(source)));
  return jsonToZod(normalized, rootName, true);
}
