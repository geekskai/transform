/**
 * Stub for @graphql-tools/relay-operation-optimizer to avoid pulling in
 * relay-compiler (which uses process.hrtime in browser/worker).
 */
"use strict";

function optimizeDocuments(_schema, documents) {
  return documents;
}

module.exports = {
  optimizeDocuments
};
