// ============================================================================
// NANO FLAGS
// ----------------------------------------------------------------------------
// Single configuration point for all runtime logging and dev behavior.
// Valid values: 'silent' | 'dev' | 'trace'
// ============================================================================

// 🧠 Main mode flag
export let LOG_LEVEL = "trace"; // Change to "trace" or "silent" as needed

// ✅ Validate and normalize
const VALID_LEVELS = ["silent", "dev", "trace"];
if (!VALID_LEVELS.includes(LOG_LEVEL)) {
  console.warn(
    `[Nano][Warn] Invalid LOG_LEVEL '${LOG_LEVEL}'. Falling back to 'dev'.`
  );
  LOG_LEVEL = "dev";
}

// 🪝 Derived flags for internal convenience
export const IS_SILENT = LOG_LEVEL === "silent";
export const IS_DEV = LOG_LEVEL === "dev" || LOG_LEVEL === "trace";
export const IS_TRACE = LOG_LEVEL === "trace";

// Optional (for future compiler builds)
// export const IS_PROD = LOG_LEVEL === "silent";
