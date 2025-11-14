// runtime/core/destroy.js
import { log } from "../logger.js";
import { safeRun } from "../utils/safeRun.js";
import { assert } from "./assert.js";

export function destroyComponent(instance) {
  assert(
    instance && typeof instance === "object",
    "destroyComponent: invalid instance",
    { instance }
  );

  const name = instance.Component?.name || "<anonymous>";

  assert(
    !instance.isDestroyed,
    `destroyComponent: double-destroy for <${name}>`,
    { instance }
  );
  instance.isDestroyed = true;

  assert(
    Array.isArray(instance.children),
    "destroyComponent: children must be array",
    { instance }
  );

  // destroy children (reverse)
  for (let i = instance.children.length - 1; i >= 0; i--) {
    const child = instance.children[i];
    assert(
      child && typeof child === "object",
      "destroyComponent: malformed child",
      { child }
    );
    assert(
      typeof child.destroy === "function",
      "destroyComponent: child missing destroy()",
      { child }
    );
    child.destroy();
  }

  instance.children.length = 0;

  // run destroy hooks
  for (const fn of instance.destroyFns) {
    assert(
      typeof fn === "function",
      "destroyComponent: destroyFn must be function",
      { fn }
    );
    safeRun(fn, `onDestroy <${name}>`);
  }

  // detach DOM
  if (instance.el) {
    assert(
      instance.el instanceof Node,
      "destroyComponent: instance.el must be a DOM Node",
      { el: instance.el }
    );
    if (instance.el.parentNode) instance.el.remove();
  }

  // unlink parent
  if (instance.parent) {
    assert(
      Array.isArray(instance.parent.children),
      "destroyComponent: parent.children must be array",
      { parent: instance.parent }
    );
    const idx = instance.parent.children.indexOf(instance);
    if (idx >= 0) instance.parent.children.splice(idx, 1);
  }

  log.trace("Unmount", `Component: ${name}`);
}
