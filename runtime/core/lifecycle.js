// runtime/lifecycle.js
import { assert } from "./assert.js";
import { getCurrentComponent } from "./context.js";

/**
 * Register an onMount hook for the current component instance.
 * Accepts a function to run when the instance is mounted.
 */
export function onMount(fn) {
  assert(typeof fn === "function", "onMount(fn) expects a function", { fn });
  const inst = getCurrentComponent();
  assert(inst, "onMount() called outside component");
  inst.mountFns.push(fn);
}

/**
 * Register an onDestroy hook for the current component instance.
 * Accepts a function to run when the instance is destroyed.
 */
export function onDestroy(fn) {
  assert(typeof fn === "function", "onDestroy(fn) expects a function", { fn });
  const inst = getCurrentComponent();
  assert(inst, "onDestroy() called outside component");
  assert(!inst.isDestroyed, "onDestroy() registered after destroy");
  inst.destroyFns.push(fn);
}
