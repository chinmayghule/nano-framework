// runtime/dom/updateList.js

import { createInstance, destroyInstance } from "./instance.js";
import { assert } from "../core/assert.js";
import { log } from "../logger.js";

/**
 * Compute ordered list of keys for the next render.
 * @param {Array} list
 * @param {Function} getKey
 * @returns {{keys: Array<string|number>, keySet: Set}}
 */
export function computeKeys(list, getKey) {
  const keys = [];
  const keySet = new Set();

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    assert(item != null, "each: item must not be null");

    const key = getKey(item, i);

    assert(
      typeof key === "string" || typeof key === "number",
      "each: key must be string or number",
      { key }
    );
    assert(!keySet.has(key), `each: duplicate key '${key}'`, { key });

    keySet.add(key);
    keys.push(key);
  }

  return { keys, keySet };
}

/**
 * Reuse old instances where possible.
 * @param {HTMLElement} container
 * @param {Map} oldMap
 * @param {Array<string|number>} keys
 * @returns {Map} newMap
 */
export function reuseInstances(container, oldMap, keys) {
  const newMap = new Map();

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const inst = oldMap.get(key);

    if (inst) {
      const anchor = container.childNodes[index] ?? null;
      container.insertBefore(inst.el, anchor);
      newMap.set(key, inst);
      log.trace("List", `Reused key: ${key}`);
    }
  }

  return newMap;
}

/**
 * Create instances for keys that didn’t exist before.
 * @param {HTMLElement} container
 * @param {Map} newMap
 * @param {Array} list
 * @param {Array<string|number>} keys
 * @param {Function} renderFn
 * @param {Object} parentInstance
 */
export function createMissingInstances(
  container,
  newMap,
  list,
  keys,
  renderFn,
  parentInstance
) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (newMap.has(key)) continue; // already reused
    const item = list[i];

    const inst = createInstance(parentInstance, renderFn, item, i, container);

    const anchor = container.childNodes[i] ?? null;
    container.insertBefore(inst.el, anchor);

    newMap.set(key, inst);
    log.trace("List", `Created key: ${key}`);
  }
}

/**
 * Remove instances whose keys disappeared.
 * @param {Map} oldMap
 * @param {Set} keySet
 */
export function removeStaleInstances(oldMap, keySet) {
  for (const [key, inst] of oldMap) {
    if (!keySet.has(key)) {
      destroyInstance(inst);
      log.trace("List", `Removed key: ${key}`);
    }
  }
}

/**
 * Full update pipeline.
 * @param {Object} props
 */
export function updateList({
  list,
  getKey,
  renderFn,
  container,
  instances,
  setInstances,
  parentInstance,
  cleaned,
}) {
  if (cleaned.current) return;

  const { keys, keySet } = computeKeys(list, getKey);

  const newMap = reuseInstances(container, instances, keys);

  createMissingInstances(
    container,
    newMap,
    list,
    keys,
    renderFn,
    parentInstance
  );

  removeStaleInstances(instances, keySet);

  setInstances(newMap);
}
