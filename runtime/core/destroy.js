// runtime/core/destroy.js
import { log } from "../logger.js";
import { safeRun } from "../utils/safeRun.js";

export function destroyComponent(instance) {
  // strict validation
  if (!instance || typeof instance !== "object") {
    throw new Error("destroyComponent: invalid instance value");
  }

  const name = instance.Component?.name || "<anonymous>";

  // idempotence guard
  if (instance.isDestroyed) {
    log.trace("Destroy", `Already destroyed: ${name}`);
    return;
  }
  instance.isDestroyed = true;

  // 1. destroy children (reverse order)
  const children = instance.children;
  if (!Array.isArray(children)) {
    throw new Error(
      `destroyComponent: instance.children is not an array in ${name}`
    );
  }

  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (!child || typeof child !== "object") {
      throw new Error(`destroyComponent: malformed child in ${name}`);
    }
    if (typeof child.destroy !== "function") {
      throw new Error(
        `destroyComponent: child instance missing destroy() in ${name}`
      );
    }
    child.destroy();
  }

  instance.children.length = 0;

  // 2. run destroy hooks
  for (const fn of instance.destroyFns) {
    safeRun(fn, `onDestroy <${name}>`);
  }

  // 3. remove DOM node
  if (instance.el) {
    if (!(instance.el instanceof Node)) {
      throw new Error(
        `destroyComponent: instance.el is not a DOM node in ${name}`
      );
    }
    if (instance.el.parentNode) instance.el.remove();
  }

  // 4. unlink from parent
  const parent = instance.parent;
  if (parent) {
    if (!Array.isArray(parent.children)) {
      throw new Error(
        `destroyComponent: parent.children is not array in ${name}`
      );
    }
    const idx = parent.children.indexOf(instance);
    if (idx !== -1) parent.children.splice(idx, 1);
  }

  // final log
  log.trace("Unmount", `Component: ${name}`);
}
