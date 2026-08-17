/* =========================================================
   screens/confirm.js — logic for confirm.html only.
   This page only makes sense if a photo or voice capture just
   put something in state.pendingMatch. If someone lands here
   directly (refresh, back button weirdness), there's nothing
   to confirm, so we bounce back to the input page.
   ========================================================= */

import { getState, updateState } from "../state.js";
import { goTo } from "../nav.js";
import { finalizeMedicine } from "./medicine.js";

const { pendingMatch } = getState();

if (!pendingMatch) {
  goTo("input.html");
} else {
  render(pendingMatch);
}

document.getElementById("confirm-back").addEventListener("click", () => goTo("input.html"));

document.getElementById("confirm-fallback").addEventListener("click", () => {
  updateState({ pendingMatch: null });
  goTo("input.html");
});

function render(match) {
  document.getElementById("top-match-name").textContent = match.top.name;
  document.getElementById("top-match-sub").textContent = match.top.sub;

  document.getElementById("confirm-btn").onclick = () => finalizeMedicine(match.top);

  const altList = document.getElementById("alt-list");
  altList.innerHTML = "";
  match.alternates.forEach((alt) => {
    const item = document.createElement("div");
    item.className = "alt-item";
    item.tabIndex = 0;
    item.innerHTML = `
      <div class="alt-name">${alt.name}</div>
      <div class="alt-sub">${alt.sub}</div>
    `;
    item.addEventListener("click", () => {
      // Swap the tapped alternate into the top spot and re-render.
      const newAlternates = [match.top, ...match.alternates.filter((a) => a.name !== alt.name)].slice(0, 2);
      const swapped = { top: alt, alternates: newAlternates };
      updateState({ pendingMatch: swapped });
      render(swapped);
    });
    altList.appendChild(item);
  });
}