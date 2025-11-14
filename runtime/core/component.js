// runtime/core/component.js
import { getCurrentComponent, pushContext, popContext } from "./context.js";
import { createInstance, linkParentChild } from "./instance.js";
import { destroyComponent } from "./destroy.js";

import { log } from "../logger.js";
import { safeRun } from "../utils/safeRun.js";
import { assert } from "./assert.js";

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

  assert(
    typeof Component === "function",
    "mountComponent: Component must be a function"
  );

  // create new instance
  const instance = createInstance(Component, parent);

  // enforce correct shape
  assert(Array.isArray(instance.children), "instance.children must be array", {
    instance,
  });
  assert(Array.isArray(instance.mountFns), "instance.mountFns must be array", {
    instance,
  });
  assert(
    Array.isArray(instance.destroyFns),
    "instance.destroyFns must be array",
    { instance }
  );

  instance.destroy = () => destroyComponent(instance);

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

  assert(
    el instanceof Node,
    `Component <${Component.name || "anonymous"}> must return a DOM Node`,
    { Component, returned: el }
  );

  instance.el = el;

  // run onMount hooks (safe execution)
  for (const fn of instance.mountFns) {
    safeRun(fn, `onMount <${instance.Component?.name || "unknown"}>`);
  }

  // append DOM element if container provided
  if (container) container.appendChild(el);

  // --- lifecycle logging ---
  log.trace("Mount", `Mounting finish: ${Component.name}`);
  log.groupEnd();

  // return closure bound to instance
  return instance.destroy;
}

/** Top-level mount: keep API mount(Component, root, props) */
export function mount(Component, root, props) {
  return mountComponent(Component, root, null, props);
}

/** Mount a child component within currently active component */
export function mountChild(Component, container, props) {
  assert(
    typeof Component === "function",
    "mountChild: Component must be a function"
  );

  const parent = getCurrentComponent();

  assert(parent, "mountChild() must be called inside a component");
  assert(!parent.isDestroyed, "mountChild: parent instance is destroyed");

  return mountComponent(Component, container, parent, props);
}
