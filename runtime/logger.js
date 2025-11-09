// ============================================================================
// NANO LOGGER
// ----------------------------------------------------------------------------
// Unified logger for Nano runtime.
// Controlled by LOG_LEVEL ('silent' | 'dev' | 'trace').
// ============================================================================

import { IS_SILENT, IS_DEV, IS_TRACE } from "./flags.js";

// 💡 Colorful labels for readability
function labelStyle(color) {
  return `color: ${color}; font-weight: bold;`;
}

export const log = {
  info(...args) {
    if (!IS_SILENT && IS_DEV)
      console.log("%c[Nano]", labelStyle("#00bcd4"), ...args);
  },

  warn(...args) {
    if (!IS_SILENT && IS_DEV)
      console.warn("%c[Nano][Warn]", labelStyle("orange"), ...args);
  },

  error(...args) {
    if (!IS_SILENT)
      console.error("%c[Nano][Error]", labelStyle("red"), ...args);
  },

  trace(type, msg, extra = "") {
    if (!IS_TRACE) return;
    if (extra) {
      console.log(`%c[Nano][${type}]`, labelStyle("#999"), msg, extra);
    } else {
      console.log(`%c[Nano][${type}]`, labelStyle("#999"), msg);
    }
  },

  groupStart(label) {
    if (IS_TRACE) console.group(`%c[Nano] ${label}`, labelStyle("#999"));
  },

  groupEnd() {
    if (IS_TRACE) console.groupEnd();
  },
};
