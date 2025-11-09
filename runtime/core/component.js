// runtime/core/component.js
import { currentComponent, setCurrentComponent } from "./context.js";
import { log } from "../logger.js";
import { IS_DEV } from "../flags.js";

/**
 * Destroys a mounted component instance and all its descendants.
 * - Runs child destroys in reverse order.
 * - Runs destroy hooks (onDestroy).
 * - Removes DOM element and unlinks from parent.
 */
export function destroyComponent(instance, ComponentName = "Unknown") {
  // log start of teardown
  log.trace("Unmount", `Component: ${ComponentName}`);

  // destroy children first (deep last)
  while (instance.children.length) {
    const child = instance.children.pop();
    try {
      child.destroy();
    } catch (e) {
      log.error(`Error destroying child of <${ComponentName}>:`, e);
    }
  }

  // run destroy hooks
  for (const fn of instance.destroyFns) {
    try {
      fn();
    } catch (e) {
      log.error(`onDestroy hook error in <${ComponentName}>:`, e);
    }
  }

  // remove the DOM node if still in document
  if (instance.el && instance.el.parentNode) instance.el.remove();

  // unlink from parent
  if (instance.parent) {
    const idx = instance.parent.children.indexOf(instance);
    if (idx >= 0) instance.parent.children.splice(idx, 1);
  }
}

/**
 * Internal: creates instance object and mounts a component into container.
 * Signature preserved: mountComponent(Component, container, parent, props)
 * Returns a destroy() function for the mounted instance.
 */
export function mountComponent(
  Component,
  container,
  parent = null,
  props = undefined
) {
  // --- lifecycle logging ---
  log.groupStart(`Mount: ${Component.name}`);
  log.trace("Mount", `Mounting start: ${Component.name}`);

  // create new instance
  const instance = {
    mountFns: [],
    destroyFns: [],
    children: [],
    parent,
    el: null,
  };

  // attach to parent’s child list if allowed
  if (parent) {
    parent.children.push(instance);
  }

  // preserve context (for nested mounts)
  const prev = currentComponent;
  setCurrentComponent(instance);

  let el;

  try {
    // attempt to render component
    el = Component(props);
  } catch (error) {
    // display helpful dev message
    log.error(`[Render Error] in <${Component.name}>`, error);
    el = document.createElement("div");
    el.textContent = error.message;
    if (container) container.appendChild(el);
  } finally {
    // always restore context
    setCurrentComponent(prev);
  }

  instance.el = el;

  // run onMount hooks (safe execution)
  for (const fn of instance.mountFns) {
    try {
      fn();
    } catch (e) {
      log.error(`onMount hook error in <${Component.name}>:`, e);
    }
  }

  // append DOM element if container provided
  if (container) container.appendChild(el);

  // --- lifecycle logging ---
  log.trace("Mount", `Mounting finish: ${Component.name}`);
  log.groupEnd();

  // return closure bound to instance
  return function destroy() {
    destroyComponent(instance, Component.name);
  };
}

/** Top-level mount: keep API mount(Component, root, props) */
export function mount(Component, root, props) {
  return mountComponent(Component, root, null, props);
}

/** Mount a child component within currently active component */
export function mountChild(Component, container, props) {
  if (!currentComponent) {
    if (IS_DEV) {
      log.warn(
        "mountChild() called outside component; falling back to root mount"
      );
      return mountComponent(Component, container, null, props);
    } else {
      throw new Error("mountChild() must be called inside a component");
    }
  }

  return mountComponent(Component, container, currentComponent, props);
}
