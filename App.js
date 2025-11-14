import { signal, mountChild, each } from "./runtime/index.js";
import { Counter } from "./Counter.js";

export function App() {
  const div = document.createElement("div");
  const container = document.createElement("div");
  const btn = document.createElement("button");
  btn.textContent = "Update List";
  div.append(btn, container);

  const items = signal([
    { id: 1, name: "Alpha" },
    { id: 2, name: "Beta" },
    { id: 3, name: "Gamma" },
  ]);

  // reactive keyed list inside a ListContainer context
  each(
    items,
    container,
    (item) => {
      const wrapper = document.createElement("div");
      const cleanup = mountChild(Counter, wrapper, { name: item.name });
      return [wrapper, cleanup];
    },
    (item) => item.id
  );

  btn.addEventListener("click", () => {
    items.set([
      { id: 2, name: "Beta" },
      { id: 4, name: "Delta" },
      { id: 1, name: "Alpha" },
    ]);
  });

  return div;
}
