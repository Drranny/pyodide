// @ts-check
import assert from "assert";
import {
  detectEnvironment,
  setRuntimeOverride,
} from "../js/environments.js";

describe("Runtime override", () => {
  afterEach(() => {
    // Reset to auto-detection after each test
    setRuntimeOverride("auto");
  });

  it("should detect Node by default", () => {
    const env = detectEnvironment();
    assert.strictEqual(env.IN_NODE, true, "Expected Node environment");
  });

  it("should override to browser", () => {
    setRuntimeOverride("browser");
    const env = detectEnvironment();
    assert.strictEqual(env.IN_BROWSER, true, "Expected browser override");
    assert.strictEqual(env.IN_NODE, false, "Node should be disabled");
  });

  it("should override to node", () => {
    setRuntimeOverride("node");
    const env = detectEnvironment();
    assert.strictEqual(env.IN_NODE, true, "Expected node override");
    assert.strictEqual(env.IN_BROWSER, false, "Browser should be disabled");
  });

  it("should override to bun", () => {
    setRuntimeOverride("bun");
    const env = detectEnvironment();
    assert.strictEqual(env.IN_BUN, true, "Expected bun override");
    assert.strictEqual(env.IN_NODE, false, "Node should be disabled");
  });

  it("should override to deno", () => {
    setRuntimeOverride("deno");
    const env = detectEnvironment();
    assert.strictEqual(env.IN_DENO, true, "Expected deno override");
    assert.strictEqual(env.IN_NODE, false, "Node should be disabled");
  });

  it("should override to webworker", () => {
    setRuntimeOverride("webworker");
    const env = detectEnvironment();
    assert.strictEqual(env.IN_BROWSER_WEB_WORKER, true, "Expected webworker override");
    assert.strictEqual(env.IN_BROWSER_MAIN_THREAD, false, "Main thread should be disabled");
  });

  it("should reset to auto when passing auto", () => {
    setRuntimeOverride("browser");
    setRuntimeOverride("auto");
    const env = detectEnvironment();
    assert.strictEqual(typeof env.IN_NODE, "boolean", "Back to auto-detection");
  });

  it("should reset to auto when passing null", () => {
    setRuntimeOverride("node");
    setRuntimeOverride(null);
    const env = detectEnvironment();
    assert.strictEqual(typeof env.IN_BROWSER, "boolean", "Back to auto-detection");
  });
});
