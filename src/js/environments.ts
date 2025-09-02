// @ts-nocheck

/** @private */
/** NOTE: switched to `let` so this live binding can be recomputed by `setRuntimeOverride()`. */
export let IN_NODE =
  typeof process === "object" &&
  typeof process.versions === "object" &&
  typeof process.versions.node === "string" &&
  !process.browser; /* This last condition checks if we run the browser shim of process */

/** @private */
export let IN_NODE_COMMONJS =
  IN_NODE &&
  typeof module !== "undefined" &&
  typeof module.exports !== "undefined" &&
  typeof require !== "undefined" &&
  typeof __dirname !== "undefined";

/** @private */
export let IN_NODE_ESM = IN_NODE && !IN_NODE_COMMONJS;

/** @private */
export let IN_BUN = typeof globalThis.Bun !== "undefined";

/** @private */
export let IN_DENO = typeof Deno !== "undefined"; // just in case...

/** @private */
export let IN_BROWSER = !IN_NODE && !IN_DENO;

/** @private */
export let IN_BROWSER_MAIN_THREAD =
  IN_BROWSER &&
  typeof window === "object" &&
  typeof document === "object" &&
  typeof document.createElement === "function" &&
  "sessionStorage" in window &&
  typeof importScripts !== "function";

/** @private */
export let IN_BROWSER_WEB_WORKER =
  IN_BROWSER && typeof importScripts === "function" && typeof self === "object";

/** @private */
export let IN_SAFARI =
  typeof navigator === "object" &&
  typeof navigator.userAgent === "string" &&
  navigator.userAgent.indexOf("Chrome") == -1 &&
  navigator.userAgent.indexOf("Safari") > -1;

/** @private */
export let IN_SHELL = typeof read == "function" && typeof load === "function";

/**
 * Detects the current environment and returns a record with the results.
 * This function is useful for debugging and testing purposes.
 * NOTE: returns a snapshot of the current live flags; flags themselves are
 * recomputed by `setRuntimeOverride()` or at module init.
 * @private
 */
export function detectEnvironment(): Record<string, boolean> {
  return {
    IN_NODE,
    IN_NODE_COMMONJS,
    IN_NODE_ESM,
    IN_BUN,
    IN_DENO,
    IN_BROWSER,
    IN_BROWSER_MAIN_THREAD,
    IN_BROWSER_WEB_WORKER,
    IN_SAFARI,
    IN_SHELL,
  };
}
/** Runtime override control:
 * Exposed knob for loadPyodide({ runtime }). Keeps minimal diff with the original file.
 */
export type Runtime = "auto" | "browser" | "webworker" | "node" | "deno" | "bun";

let __forcedRuntime: Runtime | null = null;
/** Recompute all flags:
 * 1) Start from the original detection formulas (backward compatible).
 * 2) If a forced runtime is set, override the base detection.
 * 3) Re-derive dependent flags (CJS/ESM, main-thread/worker) accordingly.
 * This keeps side effects centralized and preserves existing imports of IN_*.
 */
function __recomputeFlags() {
  let node =
    typeof process === "object" &&
    typeof process.versions === "object" &&
    typeof process.versions.node === "string" &&
    !process.browser;
  let deno = typeof Deno !== "undefined";
  let bun = typeof globalThis.Bun !== "undefined";
  let browser = !node && !deno;

  // Forced override takes precedence over auto-detection (minimal surface change).
  if (__forcedRuntime && __forcedRuntime !== "auto") {
    node = __forcedRuntime === "node";
    deno = __forcedRuntime === "deno";
    bun = __forcedRuntime === "bun";
    browser = __forcedRuntime === "browser" || __forcedRuntime === "webworker";
  }

  IN_NODE = node;
  IN_DENO = deno;
  IN_BUN = bun;
  IN_BROWSER = browser;

  // Fine-grain browser split: main-thread vs web worker.
  if (__forcedRuntime === "webworker") {
    IN_BROWSER_MAIN_THREAD = false;
    IN_BROWSER_WEB_WORKER = true;
  } else if (browser) {
    IN_BROWSER_MAIN_THREAD =
      typeof window === "object" &&
      typeof document === "object" &&
      typeof document.createElement === "function" &&
      "sessionStorage" in window &&
      typeof importScripts !== "function";

    IN_BROWSER_WEB_WORKER =
      typeof importScripts === "function" && typeof self === "object";
  } else {
    IN_BROWSER_MAIN_THREAD = false;
    IN_BROWSER_WEB_WORKER = false;
  }
  // Derive Node module system flags from the final IN_NODE state.
  IN_NODE_COMMONJS =
    IN_NODE &&
    typeof module !== "undefined" &&
    typeof module.exports !== "undefined" &&
    typeof require !== "undefined" &&
    typeof __dirname !== "undefined";

  IN_NODE_ESM = IN_NODE && !IN_NODE_COMMONJS;

  // Modify Safari detection to respect runtime override
  IN_SAFARI =
    !__forcedRuntime && // Only detect in auto mode
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Chrome") == -1 &&
    navigator.userAgent.indexOf("Safari") > -1;

  // Modify Shell detection to respect runtime override  
  IN_SHELL =
    !__forcedRuntime && 
    typeof read == "function" && 
    typeof load === "function";
}
/** Public API:
 * Force-override runtime detection. Pass 'auto' or null to restore auto-detection.
 * Intended to be called at the very beginning of loadPyodide().
 */
export function setRuntimeOverride(runtime: Runtime | null) {
  __forcedRuntime = runtime ?? null;
  __recomputeFlags();
}
__recomputeFlags();
