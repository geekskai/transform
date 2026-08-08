const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("Clerk is available throughout the Pages Router app", () => {
  const appSource = readSource("pages/_app.tsx");

  assert.match(appSource, /ClerkProvider/);
  assert.match(appSource, /signInUrl="\/sign-in"/);
  assert.match(appSource, /signUpUrl="\/sign-up"/);
});

test("Clerk middleware covers pages, API routes, and its proxy path", () => {
  const middlewareSource = readSource("middleware.ts");

  assert.match(middlewareSource, /clerkMiddleware\(\)/);
  assert.match(middlewareSource, /\/\(api\|trpc\)\(\.\*\)/);
  assert.match(middlewareSource, /\/__clerk\/\(\.\*\)/);
});

test("the header exposes signed-out actions and signed-in account controls", () => {
  const headerSource = readSource("components/HeaderNav.tsx");

  assert.match(headerSource, /<Show when="signed-out">/);
  assert.match(headerSource, /<SignInButton/);
  assert.match(headerSource, /<SignUpButton/);
  assert.match(headerSource, /<Show when="signed-in">/);
  assert.match(headerSource, /<UserButton/);
});

test("local sign-in and sign-up pages render Clerk's hosted flows", () => {
  assert.match(readSource("pages/sign-in/[[...sign-in]].tsx"), /<SignIn/);
  assert.match(readSource("pages/sign-up/[[...sign-up]].tsx"), /<SignUp/);
});
