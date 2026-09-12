# Contributing to ThreatWatch

Thank you for your interest in improving **ThreatWatch**! We welcome contributions from cybersecurity students, blue team professionals, and software engineers to enhance our educational lab scenarios and detection capabilities.

> **CRITICAL RULE**: All contributions must strictly adhere to our [Security Policy](docs/SECURITY.md). Never submit functional malware samples, real stolen credentials, or offensive exploit scripts.

---

## 1. Development Setup

### Prerequisites
- Node.js 18+ (tested on v24)
- Python 3.11+ (tested on v3.14)
- Git

### Initializing the Workspace
```bash
# Clone the repository
git clone https://github.com/suryasrisashank-cyber/threatwatch-soc.git
cd threatwatch-soc

# 1. Setup Backend
cd backend
python -m venv .venv
# Activate: source .venv/bin/activate (Linux/Mac) or .venv\Scripts\activate (Windows)
pip install -r requirements.txt
python -m pytest tests/test_backend.py -v

# 2. Setup Frontend
cd ../frontend
npm install
npm run build
```

---

## 2. Contribution Guidelines

### Adding a New Detection Rule
1. Navigate to `backend/app/services/detection_engine.py`.
2. Create a class inheriting from `DetectionRule`.
3. Specify `rule_id`, `name`, `description`, `severity`, `mitre_technique`, and `evidence_requirements`.
4. Implement the `evaluate(current_event, event_history)` method.
5. Register your rule in `DetectionEngine.__init__`.
6. Add an automated test in `backend/tests/test_backend.py`.
7. Document the rule in `docs/DETECTION-RULES.md`.

### Adding a New Learning Lab
1. Define the scenario, learning objectives, evidence JSON, challenge questions, accepted answers, and hints in `backend/app/database/seed.py`.
2. Ensure questions contain accepted answer variations and detailed forensic explanations.
3. Update `docs/LABS.md` with scenario details and educational takeaways.

---

## 3. Code Standards & Testing

Before opening a pull request, run all verification checks locally:

```bash
# Backend checks
cd backend
python -m pytest tests/ -v

# Frontend checks
cd ../frontend
npm run build
```

All tests must pass with zero errors before pull requests will be merged.

---

## 4. Submitting a Pull Request (PR)

1. Fork the repository and create a feature branch (`git checkout -b feature/new-lab-credential-stuffing`).
2. Commit your changes with descriptive commit messages.
3. Push to your fork and submit a PR to `main`.
4. Provide a clear summary in your PR description of:
   - What feature or lab was added/modified.
   - Confirmation that all data is synthetic.
   - Verification test output.
