import assert from "node:assert/strict";
import { detectEnvironment, setRuntimeOverride } from "../../dist/pyodide.mjs";

const snap = () => detectEnvironment();

{
  // auto (Node ESM)
  const env = snap();
  assert.equal(env.IN_NODE, true);
  assert.equal(env.IN_NODE_ESM, true);
  assert.equal(env.IN_BROWSER, false);
}

{
  setRuntimeOverride("browser");
  const env = snap();
  assert.equal(env.IN_BROWSER, true);
  assert.equal(env.IN_NODE, false);
}

{
  setRuntimeOverride("webworker");
  const env = snap();
  assert.equal(env.IN_BROWSER_WEB_WORKER, true);
  assert.equal(env.IN_BROWSER_MAIN_THREAD, false);
}

{
  setRuntimeOverride("deno");
  const env = snap();
  assert.equal(env.IN_DENO, true);
  assert.equal(env.IN_NODE, false);
}

{
  setRuntimeOverride(null);
  const env = snap();
  assert.equal(env.IN_NODE, true);
  assert.equal(env.IN_BROWSER, false);
}

console.log("runtime.test.mjs ✔");

