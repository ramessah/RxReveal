/* =========================================================
   nav.js — the ONLY file that changes pages.
   Every screen calls goTo("input.html") instead of setting
   window.location directly, so navigation logic stays in one
   place (useful later if we add things like transition
   animations or analytics on every navigation).
   ========================================================= */

export function goTo(page) {
  window.location.href = page;
}