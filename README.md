# RxReveal
Predict. Flag. Protect. An open-source Graph Neural Network framework for predicting harmful drug-drug interactions using molecular structures.
# RxReveal

**Predict. Flag. Protect.**

RxReveal is an open-source machine learning project that predicts harmful drug-drug interactions before they reach patients.

## Overview

Most drug interaction checkers only identify interactions that have already been documented. RxReveal uses Graph Neural Networks (GNNs) to learn from molecular structures and predict interaction risks, including drug pairs that have never been clinically studied.

## Features

- Molecular graph construction using RDKit
- Graph Neural Networks with PyTorch Geometric
- Drug-drug interaction risk prediction
- Side-effect probability estimation
- Baseline comparison using traditional machine learning models
- Explainable AI through attention visualization
- REST API built with FastAPI

## Technology Stack

- Python
- PyTorch
- PyTorch Geometric
- RDKit
- FastAPI
- Pandas
- scikit-learn
- Matplotlib
- Plotly

## Roadmap

### Phase 1
- Molecular graph construction
- GNN encoder
- Pairwise interaction prediction
- Baseline model
- Model evaluation

### Phase 2
- Explainability
- Biological feature integration
- Interactive web interface
- Multi-drug interaction research

## Status

🚧 Early Development

## License

MIT License
