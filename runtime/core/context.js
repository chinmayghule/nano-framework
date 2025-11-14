// runtime/core/context.js
import { IS_DEV } from "../flags.js";

// Internal stack of component instances
const componentStack = [];

/**
 * Returns the currently active component instance.
 */
export function getCurrentComponent() {
  const len = componentStack.length;
  return len > 0 ? componentStack[len - 1] : null;
}

/**
 * Push a component instance onto the context stack.
 */
export function pushContext(instance) {
  componentStack.push(instance);
}

/**
 * Pop the most recent component instance.
 */
export function popContext() {
  if (componentStack.length === 0) {
    if (IS_DEV) {
      console.warn("[Nano][Context] popContext() called with an empty stack");
    }
    return null;
  }
  return componentStack.pop();
}
