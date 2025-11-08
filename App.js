import { signal, each, mountChild } from "./runtime/index.js";
import { Counter } from "./Counter.js";

export function App() {
  const div = document.createElement("div");
  const container = document.createElement("div");
  const btn = document.createElement("button");

  btn.textContent = "Update List";
  div.append(btn, container);

  const names = signal(["Alpha", "Beta", "Gamma"]);

  // Render list reactively
  each(names, container, (name) => {
    const el = document.createElement("div");
    const cleanup = mountChild(Counter, el, { name });
    return [el, cleanup];
  });

  // Trigger: replace the list when button pressed
  btn.addEventListener("click", () => {
    names.set(["Delta", "Epsilon"]);
  });

  return div;
}
