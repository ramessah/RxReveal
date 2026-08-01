# RxReveal

> **Predict. Flag. Protect.**

RxReveal is an open-source AI system that predicts harmful drug-drug interactions before they reach patients.

Instead of relying solely on documented interactions, RxReveal learns from molecular structures using Graph Neural Networks (GNNs) to estimate the likelihood of adverse interactions—even for drug pairs that have never been clinically studied.

---

## Why RxReveal?

Millions of possible drug combinations exist, but only a small fraction have been tested in clinical studies.

Current interaction checkers are mostly rule-based and cannot reliably estimate risks for previously unseen drug pairs.

RxReveal aims to bridge this gap by combining graph machine learning, explainable AI, and multimodal user input.

---

# Features

### Graph Neural Network Prediction

- Molecular graph construction from SMILES
- Pairwise drug interaction prediction
- Side-effect probability estimation
- Attention-based explainability

---

### Image Recognition

Users can take a photo of:

- medicine boxes
- blister packs
- prescription labels

The system extracts the medicine name using OCR or Gemini Vision before running interaction prediction.

---

### Voice Input

Instead of typing drug names, users can simply speak them.

Speech is converted into text using Whisper Speech-to-Text before prediction.

---

### Text Input

Users may also manually type drug names.

---

## Supported Input Methods

- ⌨️ Keyboard
- 📷 Camera
- 🎤 Voice

---

# Technology Stack

## AI

- PyTorch
- PyTorch Geometric
- RDKit
- scikit-learn

## Vision

- Gemini Vision API
- EasyOCR

## Speech

- Whisper

## Backend

- FastAPI

## Data

- DrugBank
- SIDER

---

# System Pipeline

```
                User
                  │
      ┌───────────┼───────────┐
      │           │           │
 Keyboard     Camera      Voice
      │           │           │
      └───────────┼───────────┘
                  │
          Input Processing
                  │
      OCR / Gemini / Whisper
                  │
          Drug Name Validation
                  │
          DrugBank Lookup
                  │
         Molecular Structures
                  │
        Graph Neural Network
                  │
      Drug Interaction Prediction
                  │
      Risk Score + Side Effects
                  │
      Explainable AI Results
```

---

# Project Goals

- Predict unseen drug-drug interactions
- Improve medication safety
- Make AI healthcare tools accessible
- Support open-source research

---

# Development Roadmap

## Phase 1

- Drug lookup
- Molecular graph generation
- GNN implementation
- Baseline model
- Evaluation

## Phase 2

- Explainability
- Image recognition
- Voice recognition
- FastAPI backend
- Web interface

---

# License

MIT License
