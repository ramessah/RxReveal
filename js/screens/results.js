/* =========================================================
   screens/results.js — logic for results.html only.
   Reads the two confirmed medicines from state.js, then asks
   the backend for the interaction result and renders it.
   If someone lands here without two medicines (refresh, deep
   link), bounce back to the input page.
   ========================================================= */

import { getState, resetCheck } from "../state.js";
import { goTo } from "../nav.js";
import { getInteraction } from "../api.js";

const { medicines } = getState();
const [drugA, drugB] = medicines || [];

if (!drugA || !drugB) {
  goTo("input.html");
} else {
  document.getElementById("result-drug-a").textContent = drugA.name;
  document.getElementById("result-drug-b").textContent = drugB.name;
  runCheck();
}

function runCheck() {
  showState("state-loading");
  document.getElementById("retry-btn").disabled = true;
  getInteraction(drugA.name, drugB.name)
    .then(renderResult)
    .catch((err) => {
      console.error(err);
      showState("state-error");
      document.getElementById("retry-btn").disabled = false;
      document.getElementById("retry-btn").focus();
    });
}

function showState(activeId) {
  ["state-loading", "state-error", "state-result"].forEach((id) => {
    document.getElementById(id).hidden = id !== activeId;
  });
}

function renderResult(rawData) {
  const data = rawData || {};
  const risk = riskStyle(data.risk);

  const badge = document.getElementById("risk-badge");
  badge.className = `risk-badge ${risk.cls}`;
  document.getElementById("risk-label").textContent = risk.label;
  document.getElementById("risk-desc").textContent = data.desc || "";

  const effects = data.effects || [];
  const effectsList = document.getElementById("effects-list");
  effectsList.textContent = "";
  effects.forEach((effect) => {
    const item = document.createElement("div");
    item.className = "effect-item";

    const icon = document.createElement("span");
    icon.className = "effect-icon";
    icon.textContent = effect.icon || "•";

    const name = document.createElement("span");
    name.textContent = effect.name || "";

    item.append(icon, name);
    effectsList.appendChild(item);
  });
  document.getElementById("effects-title").hidden = effects.length === 0;

  const molecules = data.molecules || [];
  const moleculesEl = document.getElementById("molecules");
  moleculesEl.textContent = "";
  molecules.forEach((molecule) => {
    const card = document.createElement("div");
    card.className = "molecule-card";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", molecule.svgPath || "");
    svg.appendChild(path);

    const name = document.createElement("div");
    name.className = "molecule-name";
    name.textContent = molecule.name || "";

    const caption = document.createElement("div");
    caption.className = "molecule-caption";
    caption.textContent = molecule.caption || "";

    card.append(svg, name, caption);
    moleculesEl.appendChild(card);
  });
  document.getElementById("molecules-title").hidden = molecules.length === 0;

  showState("state-result");
  badge.focus(); // move focus to the outcome after the async swap
}

/** Map the backend's risk value to a label + badge color. */
function riskStyle(risk) {
  const value = String(risk || "").toLowerCase();
  const map = {
    safe: { label: "Safe", cls: "safe" },
    low: { label: "Low risk", cls: "safe" },
    minimal: { label: "Minimal risk", cls: "safe" },
    moderate: { label: "Caution", cls: "caution" },
    caution: { label: "Caution", cls: "caution" },
    monitor: { label: "Monitor closely", cls: "caution" },
    high: { label: "High risk", cls: "danger" },
    major: { label: "Major risk", cls: "danger" },
    severe: { label: "Severe", cls: "danger" },
    contraindicated: { label: "Contraindicated", cls: "danger" },
  };
  return map[value] || { label: risk || "Result", cls: "neutral" };
}

document.getElementById("results-back").addEventListener("click", () => goTo("input.html"));

document.getElementById("retry-btn").addEventListener("click", runCheck);

document.getElementById("new-check-btn").addEventListener("click", () => {
  resetCheck();
  goTo("index.html");
});
