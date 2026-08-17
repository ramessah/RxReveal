/* =========================================================
   api.js — the ONLY file in this project that talks to the
   network. Every screen imports from here instead of calling
   fetch() directly. When the backend is live, this is the
   only file that should need to change.
   ========================================================= */

const BASE_URL = "http://localhost:8000/api";

/**
 * GET /api/drugs/search?q=war
 * Returns: [{ name, sub }]
 */
export async function searchDrugs(query) {
  const res = await fetch(`${BASE_URL}/drugs/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Drug search failed: ${res.status}`);
  return res.json();
}

/**
 * POST /api/ocr  (multipart/form-data, field name "image")
 * Returns: { top: { name, sub }, alternates: [{ name, sub }] }
 */
export async function recognizeFromPhoto(imageBlob) {
  const formData = new FormData();
  formData.append("image", imageBlob, "capture.jpg");

  const res = await fetch(`${BASE_URL}/ocr`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`OCR failed: ${res.status}`);
  return res.json();
}

/**
 * POST /api/asr  (multipart/form-data, field name "audio")
 * Returns: { top: { name, sub }, alternates: [{ name, sub }] }
 */
export async function recognizeFromAudio(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const res = await fetch(`${BASE_URL}/asr`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`ASR failed: ${res.status}`);
  return res.json();
}

/**
 * POST /api/interaction  { drugA, drugB }
 * Returns: { risk, desc, effects: [{name, icon}], molecules: [{name, svgPath, caption}] }
 */
export async function getInteraction(drugA, drugB) {
  const res = await fetch(`${BASE_URL}/interaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drugA, drugB }),
  });
  if (!res.ok) throw new Error(`Interaction lookup failed: ${res.status}`);
  return res.json();
}