// runtime/dom/each.js
import { mountChild } from "../core/component.js";
import { currentComponent, setCurrentComponent } from "../core/context.js";
import { onDestroy } from "../core/lifecycle.js";

/**
 * Internal component that owns list items.
 * Props: { listSignal, renderFn }
 * Returns a container element. Provides full lifecycle management for its children.
 */
export function ListContainer(props) {
  const { listSignal, renderFn } = props;
  const container = document.createElement("div");

  // capture instance that was set when this component ran
  const self = currentComponent;

  let cleanupFns = [];
  let unsub = null;
  let cleaned = false;

  function masterCleanup() {
    if (cleaned) return;
    cleaned = true;
    if (unsub) unsub();
    for (const fn of cleanupFns)
      try {
        fn();
      } catch (e) {
        console.error("child cleanup error", e);
      }
    cleanupFns = [];
    container.innerHTML = "";
    // console.log("[ListContainer] destroyed");
  }

  // Register cleanup on this ListContainer instance
  if (self) onDestroy(masterCleanup);

  // subscribe - when list changes re-render items
  unsub = listSignal.subscribe((list) => {
    if (cleaned) return;

    // destroy old children
    for (const fn of cleanupFns) {
      try {
        fn();
      } catch (e) {
        console.error("child cleanup error", e);
      }
    }
    cleanupFns = [];
    container.innerHTML = "";

    // restore this component's context while rendering items so mountChild works
    const prev = currentComponent;
    setCurrentComponent(self);

    list.forEach((item, index) => {
      const result = renderFn(item, index);
      if (Array.isArray(result)) {
        const [node, cleanup] = result;
        container.appendChild(node);
        if (typeof cleanup === "function") cleanupFns.push(cleanup);
      } else {
        container.appendChild(result);
      }
    });

    setCurrentComponent(prev);
  });

  return container;
}

/** Public API: each(signalArray, container, renderFn) -> returns destroy handle of ListContainer */
export function each(signalArray, container, renderFn) {
  // mountChild will use the caller's currentComponent as parent (App)
  // It returns the destroy function of the ListContainer instance.
  return mountChild(ListContainer, container, {
    listSignal: signalArray,
    renderFn,
  });
}
