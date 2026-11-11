/**
 * Compact output for the CDP test suites (saves agent tokens). By default only result lines are
 * printed: checks (✓ / ✗), PASS / FAIL, final verdicts and errors. console.error always prints.
 * Pass --verbose for the full step-by-step log and the browser console.
 */
export const VERBOSE = process.argv.includes('--verbose');

const KEEP = /✓|✗|\bPASS\b|\bFAIL\b|VERIFIED|failed|error/i;

export function installQuietConsole() {
  if (VERBOSE) return;
  const log = console.log.bind(console);
  console.log = (...args) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (KEEP.test(first) && !first.startsWith('[Browser Console]')) log(...args);
  };
}
