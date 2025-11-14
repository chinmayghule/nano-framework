// runtime/dom/each.js

/**
 * Public keyed list renderer.
 *
 * each(signal, container, renderFn, getKey?)
 *
 * - signalArray: signal(Array)
 * - container: DOM node
 * - renderFn: (item, index) => [DOMNode, cleanupFn]
 * - getKey: (item, index) => string|number  (default: index)
 */

import { mountChild } from "../core/component.js";
import { getCurrentComponent } from "../core/context.js";
import { onDestroy } from "../core/lifecycle.js";
import { assert } from "../core/assert.js";
import { updateList } from "./updateList.js";

/**
 * @param {Object} props
 * @param {import("../reactive/signals.js").Signal} props.listSignal
 * @param {Function} props.renderFn
 * @param {Function} props.getKey
 * @returns {HTMLElement}
 */
export function ListContainer({ listSignal, renderFn, getKey }) {
  const container = document.createElement("div");
  const parentInstance = getCurrentComponent();

  let instances = new Map();
  const cleaned = { current: false };
  const setInstances = (m) => (instances = m);

  const unsubscribe = listSignal.subscribe((list) =>
    updateList({
      list,
      getKey,
      renderFn,
      container,
      instances,
      setInstances,
      parentInstance,
      cleaned,
    })
  );

  if (parentInstance) {
    onDestroy(() => {
      if (cleaned.current) return;
      cleaned.current = true;

      unsubscribe();

      for (const inst of instances.values()) inst?.cleanup?.();
      instances.clear();
      container.innerHTML = "";
    });
  }

  return container;
}

/**
 * Public API.
 */
export function each(signalArray, container, renderFn, getKey = (_, i) => i) {
  assert(container instanceof Node, "each: container must be DOM Node");

  return mountChild(ListContainer, container, {
    listSignal: signalArray,
    renderFn,
    getKey,
  });
}
