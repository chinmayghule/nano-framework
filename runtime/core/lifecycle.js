// runtime/core/lifecycle.js
import { getCurrentComponent } from "./context.js";

/** Register a callback to run after component mount. */
export function onMount(fn) {
  const parent = getCurrentComponent();

  if (!parent)
    throw new Error(
      `[Nano Error][Lifecycle][onMount:${fn.name}]\nonMount() called outside component`
    );
  parent.mountFns.push(fn);
}

/** Register a callback to run before component destroy. */
export function onDestroy(fn) {
  const parent = getCurrentComponent();

  if (!parent)
    throw new Error(
      `[Nano Error][Lifecycle][onDestroy:${fn.name}]\nonDestroy() called outside component`
    );
  parent.destroyFns.push(fn);
}
