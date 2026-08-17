/* =========================================================
   router.js — swaps which <section class="screen"> is visible.
   Every screen file calls showScreen("screen-id") to navigate;
   nothing manipulates .active classes directly outside this file.
   ========================================================= */

export function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (!target) {
    console.error(`showScreen: no screen found with id "${id}"`);
    return;
  }
  target.classList.add("active");
}