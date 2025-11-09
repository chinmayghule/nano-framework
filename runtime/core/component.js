// runtime/core/component.js
import { currentComponent, setCurrentComponent } from "./context.js";
import { onMount, onDestroy } from "./lifecycle.js";

/**
 * Internal: create instance object and mount a component into container.
 * Signature preserved: mountComponent(Component, container, parent, props)
 *
 * Returns a destroy() function for the mounted instance.
 */
export function mountComponent(
  Component,
  container,
  parent = null,
  props = undefined
) {
  // instance shape same as before
  const instance = {
    mountFns: [],
    destroyFns: [],
    children: [],
    parent,
    el: null,
    // small flag: if true, parent shouldn't automatically walk this subtree
    isDetachedSubtree: false,
  };

  // define destroy function (returned to caller)
  function destroy() {
    // destroy children first (reverse order)
    while (instance.children.length) {
      const child = instance.children.pop();
      try {
        child.destroy();
      } catch (e) {
        console.error("Error destroying child:", e);
      }
    }

    // run destroy hooks
    for (const fn of instance.destroyFns) {
      try {
        fn();
      } catch (e) {
        console.error("onDestroy hook error:", e);
      }
    }

    // remove element
    if (instance.el && instance.el.parentNode) instance.el.remove();

    // unlink from parent list if present (parent should remove us)
    if (instance.parent) {
      const idx = instance.parent.children.indexOf(instance);
      if (idx >= 0) instance.parent.children.splice(idx, 1);
    }
  }

  // attach to parent children list only if parent exists and this isn't detached
  if (parent && !instance.isDetachedSubtree) {
    parent.children.push(instance);
  }

  // preserve context stack (important for nested mounts)
  const prev = currentComponent;
  setCurrentComponent(instance);

  // execute component function to create DOM (component may call mountChild)
  const el = Component(props);

  // restore previous context
  setCurrentComponent(prev);

  instance.el = el;

  // run mount hooks
  for (const fn of instance.mountFns) {
    try {
      fn();
    } catch (e) {
      console.error("onMount hook error:", e);
    }
  }

  // append to container if provided
  if (container) container.appendChild(el);

  // return the destroy function (closure captures instance)
  return destroy;
}

/** Top-level mount: keep API mount(Component, root, props) */
export function mount(Component, root, props) {
  return mountComponent(Component, root, null, props);
}

/** Mount a child component within currently active component */
export function mountChild(Component, container, props) {
  if (!currentComponent)
    throw new Error("mountChild() must be used inside a component");
  // mountComponent returns a destroy function
  const destroy = mountComponent(Component, container, currentComponent, props);
  return destroy;
}
