// runtime/utils/safeRun.js
import { log } from "../logger.js";

/**
 * Safely invoke fn. If fn throws, log and continue.
 * label is optional and used for better logging context.
 */
export function safeRun(fn, label) {
  try {
    fn();
  } catch (err) {
    // label is useful for debugging which hook failed
    if (!label) {
      log.error("[SafeRun] error:", err);
      return;
    }

    log.error(`[SafeRun] error in ${label}:`, err);
  }
}
