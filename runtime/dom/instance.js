// runtime/dom/instance.js

import { pushContext, popContext } from "../core/context.js";
import { assert } from "../core/assert.js";
import { log } from "../logger.js";

/**
 * @typedef {Object} ListItemInstance
 * @property {Node} el
 * @property {Function|null} cleanup
 */

/**
 * Create a render instance for a list item.
 * @param {Object} parentInstance - Component instance owning the list.
 * @param {Function} renderFn - (item, index) => [el, cleanup]
 * @param {*} item - Data item
 * @param {number} index - Index in array
 * @param {HTMLElement} container - Parent DOM node
 * @returns {ListItemInstance}
 */
export function createInstance(parentInstance, renderFn, item, index) {
  pushContext(parentInstance);

  let result;
  try {
    result = renderFn(item, index);
  } catch (err) {
    log.error("[Render Error in <ListContainer>]", err);
    const fallback = document.createElement("div");
    fallback.textContent = err.message;
    result = [fallback, null];
  } finally {
    popContext();
  }

  assert(Array.isArray(result), "renderFn must return [el, cleanup]");

  const [el, cleanup] = result;

  assert(el instanceof Node, "renderFn element must be a DOM node");
  if (cleanup != null) {
    assert(typeof cleanup === "function", "cleanup must be function or null");
  }

  return { el, cleanup };
}

/**
 * Destroy a list item instance.
 * @param {ListItemInstance} inst
 */
export function destroyInstance(inst) {
  assert(inst, "destroyInstance: inst missing");

  if (inst.cleanup) inst.cleanup();

  assert(inst.el instanceof Node, "destroyInstance: inst.el must be DOM node");
  inst.el.remove();
}
