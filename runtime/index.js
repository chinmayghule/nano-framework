// runtime/index.js
export * from "./core/context.js";
export * from "./core/lifecycle.js";
export * from "./core/component.js";
export * from "./reactive/signals.js";
export * from "./dom/each.js";

// flags
export const __DEV__ = true; // later can be toggled via build flag
