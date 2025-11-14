// runtime/core/component.js
import { getCurrentComponent, pushContext, popContext } from "./context.js";
import { createInstance, linkParentChild } from "./instance.js";
import { destroyComponent } from "./destroy.js";

import { log } from "../logger.js";
import { IS_DEV } from "../flags.js";

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
  const instance = createInstance(Component, parent);

  // attach to parent’s child list if allowed
  linkParentChild(parent, instance);

  // push instance onto context stack
  pushContext(instance);

  let el;

  try {
    // render component
    el = Component(props);
  } catch (error) {
    // display helpful dev message
    log.error(`[Render Error] in <${Component.name}>`, error);
    el = document.createElement("div");
    el.textContent = error.message;
    if (container) container.appendChild(el);
  } finally {
    // always restore context
    popContext();
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
  const parent = getCurrentComponent();

  if (!parent) {
    if (IS_DEV) {
      log.warn(
        "mountChild() called outside component; falling back to root mount"
      );
      return mountComponent(Component, container, null, props);
    } else {
      throw new Error("mountChild() must be called inside a component");
    }
  }

  return mountComponent(Component, container, parent, props);
}
