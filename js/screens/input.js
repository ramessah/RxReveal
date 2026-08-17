/* =========================================================
   screens/input.js — logic for input.html only.
   Because this is now a real separate page, everything about
   "which medicine am I on" has to be re-read from state.js
   (sessionStorage) on every load — there's no leftover JS
   variable from the previous page to rely on.
   ========================================================= */

import { getState, updateState } from "../state.js";
import { goTo } from "../nav.js";
import { searchDrugs, recognizeFromPhoto, recognizeFromAudio } from "../api.js";
import { finalizeMedicine } from "./medicine.js";

const typeInput = document.getElementById("type-input");
const suggestionsEl = document.getElementById("suggestions");
let debounceTimer = null;

// ---- run on page load ----
// Note: wirePhotoTab() and wireSpeakTab() are called at the END of this file,
// after every element const below has been declared (they reference them).
renderHeader();
wireBackButton();
wireModeTabs();
typeInput.addEventListener("input", handleTypeInput);

function renderHeader() {
  const { medicineIndex, medicines } = getState();

  document.getElementById("input-topbar-title").textContent = `Medicine ${medicineIndex} of 2`;
  document.getElementById("input-heading").textContent =
    medicineIndex === 1 ? "Add the first medicine" : "Add the second medicine";

  const seg1 = document.getElementById("seg-1");
  const seg2 = document.getElementById("seg-2");
  const label1 = document.getElementById("label-1");
  const label2 = document.getElementById("label-2");

  seg1.className = "progress-seg done";
  seg2.className = "progress-seg" + (medicineIndex === 2 ? " current" : "");

  if (medicineIndex === 1) {
    label1.className = "progress-label current";
    label1.innerHTML = `<span class="step-dot">1</span><span>Medicine 1</span>`;
    label2.className = "progress-label";
    label2.innerHTML = `<span class="step-dot">2</span><span>Medicine 2</span>`;
  } else {
    label1.className = "progress-label done";
    label1.innerHTML = `<span class="step-dot">✓</span><span>${medicines[0].name}</span>`;
    label2.className = "progress-label current";
    label2.innerHTML = `<span class="step-dot">2</span><span>Medicine 2</span>`;
  }
}

function wireBackButton() {
  document.getElementById("input-back").addEventListener("click", () => {
    const { medicineIndex } = getState();
    if (medicineIndex === 2) {
      // Go back to picking medicine 1 again — same page, updated state.
      updateState({ medicineIndex: 1 });
      renderHeader();
    } else {
      goTo("index.html");
    }
  });
}

function wireModeTabs() {
  document.querySelectorAll(".method-tab").forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });
}

function setMode(mode) {
  document.querySelectorAll(".method-tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.mode === mode)
  );
  document.querySelectorAll(".mode-panel").forEach((p) => p.classList.remove("active"));
  document.getElementById(`panel-${mode}`).classList.add("active");

  if (mode === "photo") {
    startCamera();
  } else {
    stopCamera();
  }

  // Never keep recording in the background on another tab.
  if (mode !== "speak") {
    stopSpeakIfActive();
  }
}

function handleTypeInput() {
  clearTimeout(debounceTimer);
  const query = typeInput.value.trim();

  if (!query) {
    suggestionsEl.innerHTML = "";
    return;
  }

  debounceTimer = setTimeout(() => runSearch(query), 300);
}

async function runSearch(query) {
  suggestionsEl.innerHTML = `<div class="suggestion-status">Searching…</div>`;
  try {
    const matches = await searchDrugs(query);
    renderSuggestions(matches);
  } catch (err) {
    console.error(err);
    suggestionsEl.innerHTML = `<div class="suggestion-status error">Couldn't reach the server. Is the backend running?</div>`;
  }
}

function renderSuggestions(matches) {
  suggestionsEl.innerHTML = "";
  if (matches.length === 0) {
    suggestionsEl.innerHTML = `<div class="suggestion-status">No matches found.</div>`;
    return;
  }
  matches.forEach((drug) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.tabIndex = 0;
    item.innerHTML = `
      <div>
        <div class="suggestion-name">${drug.name}</div>
        <div class="suggestion-sub">${drug.sub}</div>
      </div>
    `;
    item.addEventListener("click", () => finalizeMedicine(drug));
    suggestionsEl.appendChild(item);
  });
}

/* =========================================================
   Photo tab
   ========================================================= */

const videoEl = document.getElementById("camera-video");
const thumbEl = document.getElementById("captured-thumb");
const canvasEl = document.getElementById("capture-canvas");
const cameraStatus = document.getElementById("camera-status");
const shutterBtn = document.getElementById("shutter-btn");
const captureRow = document.getElementById("capture-row");
const retakeRow = document.getElementById("retake-row");
const photoProcessing = document.getElementById("photo-processing");

let mediaStream = null;
let capturedBlob = null;

async function startCamera() {
  // Already running — nothing to do.
  if (mediaStream) return;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, // prefer the back camera on phones
    });
    videoEl.srcObject = mediaStream;
    cameraStatus.hidden = true;
    shutterBtn.disabled = false;
  } catch (err) {
    console.error("Camera access failed:", err);
    cameraStatus.hidden = false;
    cameraStatus.textContent =
      "Couldn't access the camera. Check your browser's camera permission, or type the name instead.";
    shutterBtn.disabled = true;
  }
}

function stopCamera() {
  if (!mediaStream) return;
  mediaStream.getTracks().forEach((track) => track.stop());
  mediaStream = null;
}

// Stop the camera and mic if the person navigates away entirely (back button, closing tab).
window.addEventListener("beforeunload", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  stopCamera();
  stopMicTracks();
  clearInterval(recTimerId);
});

function wirePhotoTab() {
  shutterBtn.addEventListener("click", capturePhoto);
  document.getElementById("retake-btn").addEventListener("click", resetToLiveCamera);
  document.getElementById("use-photo-btn").addEventListener("click", usePhoto);
  document.getElementById("photo-fallback").addEventListener("click", () => setMode("type"));
}

function capturePhoto() {
  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  canvasEl.getContext("2d").drawImage(videoEl, 0, 0);

  canvasEl.toBlob((blob) => {
    capturedBlob = blob;
    thumbEl.src = URL.createObjectURL(blob);
  }, "image/jpeg", 0.9);

  videoEl.hidden = true;
  thumbEl.hidden = false;
  captureRow.hidden = true;
  retakeRow.hidden = false;
}

function resetToLiveCamera() {
  capturedBlob = null;
  videoEl.hidden = false;
  thumbEl.hidden = true;
  captureRow.hidden = false;
  retakeRow.hidden = true;
  photoProcessing.hidden = true;
}

async function usePhoto() {
  if (!capturedBlob) return;

  retakeRow.hidden = true;
  photoProcessing.hidden = false;

  try {
    const match = await recognizeFromPhoto(capturedBlob);
    updateState({ pendingMatch: match });
    stopCamera();
    goTo("confirm.html");
  } catch (err) {
    console.error(err);
    photoProcessing.hidden = true;
    retakeRow.hidden = false;
    cameraStatus.hidden = false;
    cameraStatus.textContent = "Couldn't reach the server. Is the backend running?";
  }
}

/* =========================================================
   Speak tab
   ========================================================= */

const micBtn = document.getElementById("mic-btn");
const micLabel = document.getElementById("mic-label");
const recStateEl = document.getElementById("rec-state");
const recTimerEl = document.getElementById("rec-timer");
const stopRecBtn = document.getElementById("stop-rec-btn");
const recActions = document.getElementById("rec-actions");
const recordAgainBtn = document.getElementById("record-again-btn");
const useRecordingBtn = document.getElementById("use-recording-btn");
const micStatus = document.getElementById("mic-status");
const speechProcessing = document.getElementById("speech-processing");
const audioPreviewWrap = document.getElementById("audio-preview-wrap");
const audioPreview = document.getElementById("audio-preview");

let micStream = null;
let mediaRecorder = null;
let recChunks = [];
let recTimerId = null;
let recStartTime = 0;
let recordedBlob = null;
let isRecording = false;
let isStarting = false;

function wireSpeakTab() {
  micBtn.addEventListener("click", startRecording);
  stopRecBtn.addEventListener("click", stopRecording);
  recordAgainBtn.addEventListener("click", resetSpeakToIdle);
  useRecordingBtn.addEventListener("click", useRecording);
  document.getElementById("speak-fallback").addEventListener("click", () => setMode("type"));
}

function pickMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

async function startRecording() {
  if (isRecording || isStarting) return;
  if (typeof MediaRecorder === "undefined") {
    micStatus.hidden = false;
    micStatus.textContent = "Voice recording isn't supported in this browser. Type the name instead.";
    return;
  }

  isStarting = true;

  try {
    if (!micStream) {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    const mimeType = pickMimeType();
    mediaRecorder = new MediaRecorder(micStream, mimeType ? { mimeType } : undefined);
    recChunks = [];

    mediaRecorder.addEventListener("dataavailable", (e) => {
      if (e.data && e.data.size > 0) recChunks.push(e.data);
    });
    mediaRecorder.addEventListener("stop", onRecordingStopped);
    mediaRecorder.addEventListener("error", () => {
      micStatus.hidden = false;
      micStatus.textContent = "The recording failed. Please try again.";
      resetSpeakToIdle();
    });

    mediaRecorder.start();
    isRecording = true;

    micBtn.hidden = true;
    micLabel.hidden = true;
    recStateEl.hidden = false;
    recActions.hidden = true;
    audioPreviewWrap.hidden = true;
    speechProcessing.hidden = true;
    micStatus.hidden = true;

    recStartTime = Date.now();
    updateRecTimer();
    recTimerId = setInterval(updateRecTimer, 250);
    stopRecBtn.focus(); // keep keyboard/screen-reader focus on the visible control
  } catch (err) {
    console.error("Microphone access failed:", err);
    micStatus.hidden = false;
    micStatus.textContent =
      "Couldn't access the microphone. Check your browser's permission, or type the name instead.";
    micBtn.disabled = true;
  } finally {
    isStarting = false;
  }
}

function updateRecTimer() {
  const totalSecs = Math.floor((Date.now() - recStartTime) / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  recTimerEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state !== "recording") return;
  mediaRecorder.stop(); // fires "stop" → onRecordingStopped
}

function onRecordingStopped() {
  if (!mediaRecorder) return; // a reset (e.g. error path) already ran
  stopMicTracks();
  clearInterval(recTimerId);
  recTimerId = null;
  isRecording = false;

  const type = mediaRecorder.mimeType || "audio/webm";
  recordedBlob = new Blob(recChunks, { type });
  recChunks = [];

  recStateEl.hidden = true;

  if (!recordedBlob.size) {
    micStatus.hidden = false;
    micStatus.textContent = "Nothing was recorded. Please try again.";
    micBtn.hidden = false;
    micLabel.hidden = false;
    return;
  }

  if (audioPreview.src) URL.revokeObjectURL(audioPreview.src);
  audioPreview.src = URL.createObjectURL(recordedBlob);
  audioPreviewWrap.hidden = false;
  recActions.hidden = false;
}

function resetSpeakToIdle() {
  clearInterval(recTimerId);
  recTimerId = null;
  isRecording = false;
  recordedBlob = null;
  recChunks = [];

  if (audioPreview.src) {
    URL.revokeObjectURL(audioPreview.src);
    audioPreview.removeAttribute("src");
    audioPreview.load();
  }

  mediaRecorder = null;
  micBtn.hidden = false;
  micLabel.hidden = false;
  recStateEl.hidden = true;
  recActions.hidden = true;
  audioPreviewWrap.hidden = true;
  speechProcessing.hidden = true;
  micStatus.hidden = true;
  micStatus.textContent = "";
  if (!micBtn.disabled) micBtn.focus();
}

async function useRecording() {
  if (!recordedBlob) return;

  recActions.hidden = true;
  speechProcessing.hidden = false;

  try {
    const match = await recognizeFromAudio(recordedBlob);
    updateState({ pendingMatch: match });
    goTo("confirm.html");
  } catch (err) {
    console.error(err);
    speechProcessing.hidden = true;
    recActions.hidden = false;
    micStatus.hidden = false;
    micStatus.textContent = "Couldn't reach the server. Is the backend running?";
  }
}

function stopMicTracks() {
  if (!micStream) return;
  micStream.getTracks().forEach((track) => track.stop());
  micStream = null;
}

function stopSpeakIfActive() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop(); // onRecordingStopped shows the ready state
  }
}

// ---- run on page load (after all declarations) ----
wirePhotoTab();
wireSpeakTab();