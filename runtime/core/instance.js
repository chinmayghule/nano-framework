// runtime/core/instance.js

/**
 * Create a fresh component instance.
 */
export function createInstance(Component, parent) {
  return {
    Component,
    parent,
    el: null,
    children: [],

    mountFns: [],
    destroyFns: [],
  };
}

/**
 * Link child to parent.
 */
export function linkParentChild(parent, child) {
  if (parent) {
    parent.children.push(child);
  }
}
