// ============================================================================
// NANO RUNTIME — component.js
// ----------------------------------------------------------------------------
// Handles component creation, hierarchy, mounting, and teardown.
// Depends on lifecycle.js for context management.
// ============================================================================

import { currentComponent, setCurrentComponent } from "./lifecycle.js";

/**
 * Internal: Mount a component instance (used by both mount() and mountChild()).
 */
function mountComponent(
  Component,
  container,
  parent = null,
  props = undefined
) {
  const instance = {
    mountFns: [],
    destroyFns: [],
    children: [],
    parent,
    el: null,
    destroy: null,
  };

  // Define destruction logic
  instance.destroy = () => {
    // destroy children first
    while (instance.children.length) {
      const child = instance.children.pop();
      child.destroy();
    }

    // run destroy hooks
    instance.destroyFns.forEach((fn) => fn());

    // remove from DOM
    if (instance.el && instance.el.parentNode) instance.el.remove();

    // unlink from parent
    if (instance.parent) {
      const idx = instance.parent.children.indexOf(instance);
      if (idx >= 0) instance.parent.children.splice(idx, 1);
    }
  };

  // Attach to parent hierarchy *only if parent is a normal component*.
  // Special constructs (like 'each') may handle their own cleanup and
  // should not be tracked as standard children.
  if (parent && !instance.isDetachedSubtree) {
    parent.children.push(instance);
  }

  // preserve context stack for nested components
  const prev = currentComponent;
  setCurrentComponent(instance);
  const el = Component(props);
  setCurrentComponent(prev);

  // store DOM element reference
  instance.el = el;

  // run mount hooks
  instance.mountFns.forEach((fn) => fn());

  // attach to container
  if (container) container.appendChild(el);

  return instance.destroy;
}

/**
 * Mount a root-level component.
 * @returns {Function} destroy() - unmounts the component and its children.
 */
export function mount(Component, root, props) {
  return mountComponent(Component, root, null, props);
}

/**
 * Mount a child component under the currently active parent.
 * Automatically links lifecycles and hierarchy.
 */
export function mountChild(Component, container, props) {
  if (!currentComponent)
    throw new Error("mountChild() must be used inside a component");
  return mountComponent(Component, container, currentComponent, props);
}
