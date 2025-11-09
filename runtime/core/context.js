// runtime/core/context.js
export let currentComponent = null;

export function setCurrentComponent(value) {
  currentComponent = value;
}
