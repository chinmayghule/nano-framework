// runtime/core/lifecycle.js
import { currentComponent } from "./context.js";

/** Register a callback to run after component mount. */
export function onMount(fn) {
  if (!currentComponent) throw new Error("onMount() called outside component");
  currentComponent.mountFns.push(fn);
}

/** Register a callback to run before component destroy. */
export function onDestroy(fn) {
  if (!currentComponent)
    throw new Error("onDestroy() called outside component");
  currentComponent.destroyFns.push(fn);
}
