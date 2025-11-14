// runtime/utils/assert.js
import { IS_DEV } from "../flags.js";
import { log } from "../logger.js";

/**
 * Strict invariant checker.
 *
 * - Only active in development.
 * - No performance cost in production.
 * - Throws immediately on violation.
 * - Optional metadata is attached to the error object.
 */
export function assert(cond, message, meta) {
  if (!IS_DEV) return; // Disabled in production builds

  if (cond) return;

  const err = new Error(`[Nano][Assert] ${message}`);

  // Attach metadata if provided (helps with debugging)
  if (meta !== undefined) {
    try {
      err.meta = meta;
    } catch {}
  }

  // Log useful information
  log.error(`[Nano][Assert] ${message}`, meta);

  throw err;
}
