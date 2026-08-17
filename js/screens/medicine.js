/* =========================================================
   medicine.js — one shared function for "this medicine is
   confirmed, move on." Both input.js (type tab) and
   confirm.js (photo/speak tab) call this so the advance-to-
   next-medicine-or-results logic only exists in one place.
   ========================================================= */

import { getState, updateState } from "../state.js";
import { goTo } from "../nav.js";

export function finalizeMedicine(drug) {
  const { medicineIndex, medicines } = getState();
  const updated = [...medicines];
  updated[medicineIndex - 1] = drug;

  if (medicineIndex === 1) {
    updateState({ medicineIndex: 2, medicines: updated, pendingMatch: null });
    goTo("input.html");
  } else {
    updateState({ medicines: updated, pendingMatch: null });
    goTo("results.html");
  }
}