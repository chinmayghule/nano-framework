// runtime/dom.js
import {
  setCurrentComponent,
  onDestroy,
  currentComponent,
} from "./lifecycle.js";
import { mountChild } from "./component.js";

/**
 * Internal ListContainer component (owned by each()).
 * Props: { listSignal, renderFn }
 */
export function ListContainer(props) {
  const { listSignal, renderFn } = props;
  const container = document.createElement("div");

  // Capture THIS component instance (currentComponent) so we can restore it in async callbacks
  const self = currentComponent;

  let cleanupFns = [];
  let unsub = null;
  let cleaned = false;

  const masterCleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (unsub) unsub();
    for (const fn of cleanupFns) fn();
    cleanupFns = [];
    container.innerHTML = "";
    console.log("[ListContainer] masterCleanup");
  };

  // Register that masterCleanup should run when this ListContainer is destroyed
  if (self) onDestroy(masterCleanup);

  // Subscribe to the list signal
  unsub = listSignal.subscribe((list) => {
    // If already cleaned via destroy, ignore further updates
    if (cleaned) return;

    // destroy previous children
    for (const fn of cleanupFns) fn();
    cleanupFns = [];
    container.innerHTML = "";

    // Restore this component context so renderFn and mountChild work inside it
    const prev = currentComponent;
    setCurrentComponent(self);

    // Render items — renderFn can call mountChild safely now
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

    // Restore previous context
    setCurrentComponent(prev);
  });

  return container;
}

/**
 * Public each() mounts a ListContainer component under the caller.
 * It returns the destroy handle produced by mountChild.
 */
export function each(signalArray, container, renderFn) {
  // mountChild must be called while a component context exists (App)
  return mountChild(ListContainer, container, {
    listSignal: signalArray,
    renderFn,
  });
}
