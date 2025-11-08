// ============================================================================
// NANO RUNTIME — lifecycle.js
// ----------------------------------------------------------------------------
// Manages component context and lifecycle hooks.
// ============================================================================

/** The component currently being created or rendered. */
export let currentComponent = null;

/**
 * Internal setter used by runtime to mutate context.
 * We must define this here because ES module exports are read-only externally.
 */
export function setCurrentComponent(value) {
  currentComponent = value;
}

/** Register a function to run after component mount. */
export function onMount(fn) {
  if (!currentComponent) throw new Error("onMount() called outside component");
  currentComponent.mountFns.push(fn);
}

/** Register a function to run before component destruction. */
export function onDestroy(fn) {
  if (!currentComponent)
    throw new Error("onDestroy() called outside component");
  currentComponent.destroyFns.push(fn);
}
