// runtime/lifecycle.js
import { getCurrentComponent } from "./context.js";
import { IS_DEV } from "../flags.js";

/**
 * Register an onMount hook for the current component instance.
 * Accepts a function to run when the instance is mounted.
 */
export function onMount(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("onMount(fn) expects a function");
  }
  const inst = getCurrentComponent();
  if (!inst) {
    const msg = "onMount() called outside a component";
    if (IS_DEV) {
      console.warn("[Nano][Warn]", msg);
      return;
    }
    throw new Error(msg);
  }
  inst.mountFns.push(fn);
}

/**
 * Register an onDestroy hook for the current component instance.
 * Accepts a function to run when the instance is destroyed.
 */
export function onDestroy(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("onDestroy(fn) expects a function");
  }
  const inst = getCurrentComponent();
  if (!inst) {
    const msg = "onDestroy() called outside a component";
    if (IS_DEV) {
      console.warn("[Nano][Warn]", msg);
      return;
    }
    throw new Error(msg);
  }
  inst.destroyFns.push(fn);
}
