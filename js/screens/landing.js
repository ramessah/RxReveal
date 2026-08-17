/* =========================================================
   screens/landing.js — logic for index.html only.
   Loaded directly by index.html's <script> tag, not through
   a shared main.js, since each page now loads just what it needs.
   ========================================================= */

import { resetCheck } from "../state.js";
import { goTo } from "../nav.js";

document.getElementById("start-check").addEventListener("click", () => {
  resetCheck();
  goTo("input.html");
});