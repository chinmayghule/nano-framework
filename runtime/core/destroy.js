// runtime/core/destroy.js
import { log } from "../logger.js";

export function destroyComponent(instance) {
  // destroy children first
  while (instance.children.length) {
    const child = instance.children.pop();
    try {
      child.destroy();
    } catch (e) {
      log.error("Error destroying child:", e);
    }
  }

  // run destroy hooks
  for (const fn of instance.destroyFns) {
    try {
      fn();
    } catch (e) {
      log.error("onDestroy hook error:", e);
    }
  }

  // remove element
  if (instance.el && instance.el.parentNode) {
    instance.el.remove();
  }

  // unlink from parent
  if (instance.parent) {
    const idx = instance.parent.children.indexOf(instance);
    if (idx >= 0) instance.parent.children.splice(idx, 1);
  }

  log.trace("Unmount", `Component: ${instance.Component?.name}`);
}
