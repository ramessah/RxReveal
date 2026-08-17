/* =========================================================
   state.js — shared app state, persisted in sessionStorage.

   Why sessionStorage and not a plain JS object: each screen
   is now a real page load (index.html -> input.html -> ...).
   A normal JS variable would reset to nothing every time the
   browser loads a new page. sessionStorage survives across
   page loads for the same browser tab, and clears itself when
   the tab closes — which is exactly the lifetime we want for
   "one drug-interaction check."
   ========================================================= */

const STORAGE_KEY = "rxreveal_state";

const DEFAULT_STATE = {
  medicineIndex: 1,          // 1 or 2 — which medicine we're currently adding
  medicines: [null, null],   // confirmed { name, sub } objects
  pendingMatch: null,        // { top, alternates } — set right before the confirm screen
};

/** Read the current state. Falls back to defaults if nothing is stored yet. */
export function getState() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_STATE };
  try {
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/** Merge `updates` into the stored state and save it back. */
export function updateState(updates) {
  const current = getState();
  const next = { ...current, ...updates };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Wipe everything and start a fresh check. */
export function resetCheck() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
}