import { signal, onMount, onDestroy } from "./runtime/index.js";

export function Counter({ name }) {
  const div = document.createElement("div");
  const p = document.createElement("p");
  const btn = document.createElement("button");

  const count = signal(0);
  btn.textContent = `+1 (${name})`;

  btn.addEventListener("click", () => count.set(count.get() + 1));

  count.subscribe((v) => {
    p.textContent = `${name}: ${v}`;
  });

  onMount(() => console.log(`Counter "${name}" mounted`));
  onDestroy(() => console.log(`Counter "${name}" destroyed`));

  div.append(p, btn);
  return div;
}
