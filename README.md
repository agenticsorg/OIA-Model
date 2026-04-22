<div align="center">

<img src="public/logo.png" alt="Agentics Foundation" height="96" />

### Agentics Foundation

# The OIA Model · Reader

An interactive review and implementation workspace for the **Open Intelligence Architecture** — a nine-layer reference architecture for enterprise intelligent systems.

[![License: MIT](https://img.shields.io/badge/License-MIT-F05122.svg?style=flat-square)](LICENSE)
[![Live](https://img.shields.io/badge/live-oia.agentics.org-F05122.svg?style=flat-square)](https://oia.agentics.org)
[![Version](https://img.shields.io/badge/version-0.1-white.svg?style=flat-square)](docs/OIA-Model-v0.1-Digest.md)
[![Cloud Run](https://img.shields.io/badge/runtime-Cloud%20Run-white.svg?style=flat-square)](#deployment)
[![React 18](https://img.shields.io/badge/React-18-white.svg?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-white.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-white.svg?style=flat-square)](https://vitejs.dev)

**[ Live · oia.agentics.org ](https://oia.agentics.org)** &nbsp;·&nbsp;
**[ Reader's Digest ](docs/OIA-Model-v0.1-Digest.md)** &nbsp;·&nbsp;
**[ Decision Log ](docs/OIA-Model-v0.1-Decision-Log-Digest.md)** &nbsp;·&nbsp;
**[ ADR-0001 ](plans/ADR-0001-oia-model-reader-ui.md)**

</div>

---

## About

The **OIA Model** — Open Intelligence Architecture — is the Agentics Foundation's reference architecture for intelligent systems at enterprise scale. It defines nine layers (physical compute at the bottom, the human and browser interface at the top), two state-holding layers that bracket the operational core, and six horizontal cross-layer spans that cannot be localised to any one layer.

This repository contains the **OIA Model Reader**: a single-page application that turns the two published digests (the Reader's Digest and the Decision Log Digest) into a practical, interactive system — allowing reviewers, architects, vendors, regulators, and researchers to *use* the model rather than just read it.

Every section of the source documents is preserved verbatim. Every section also carries a tied-in **operator tool** that produces a real Markdown artefact (brief, spec, memo, plan) you can paste straight into your operations.

---

## Feature Highlights

### Reading surface (verbatim from the source digests)
- Masthead and foreword in their original institutional + personal registers
- §1 Introduction through §8 Deferrals, the Decision Log Digest, and the Closing — every paragraph preserved
- Six figure-quality SVG visualisations positioned inline with the prose they illuminate

### Interactive implementation workspace
| Tool | What it produces |
|------|------------------|
| **Workspace** (hub) | Live KPIs + single-file Markdown *Review Package* + JSON bundle for team sharing |
| **Stack Diagram** | Interactive 10-layer × 6-span canvas with Assessment overlay |
| **Architecture Assessment** | Rate each layer COHERENT / GAP / NOT YET / N/A — live span coherence scores |
| **Provider Footprint** | 33-vendor × 10-layer matrix; flags "vertical extension" (Decision 10) |
| **Implementation Roadmap** | Per-layer checklists, Markdown plan export |
| **Explorer** | Search 55 concerns, 91 reference technologies, 42 open questions |
| **Decision Review Register** | Per-decision vote (REOPEN / HOLD / CONFIRM) + Markdown export |
| **Feedback** | Form backed by SQLite, five Foundation-featured questions + eleven review prompts |

### Per-section operator tools
Each prose section has a tied-in micro-tool that turns the content into a business deliverable:

| Section | Operator tool | Artefact |
|--------|---------------|----------|
| On Reading | Reading Plan Generator | Team-channel reading plan by role × depth |
| Foreword | Era Transition Brief | Exec-level "we are at this moment" memo |
| §1 Introduction | System Scope Generator | Project-charter scope statement |
| §2.1 Lineage | Governance Overlay | Framework-stack mapping to OIA |
| §2.2 Context | Urgency Brief | Board-level urgency memo |
| §2.3 Properties | Layer Priority Plan | Ranked investment plan |
| §3 Nine Layers | Layer Scope Memo | RACI-style owned-layers memo |
| §5 Spans | Span Gap Memo | CISO / audit gap memo |
| §6 Relationships | Stack Spec | Governance stack spec for ARB / RFP |
| §7 Adoption | Adoption Playbook | Four-step program kickoff |
| §8 Deferrals | Community Input | Submission to the Foundation |
| Decision Log | Reviewer Brief | Stance-tailored review protocol |

All tools persist state to `localStorage`; every exported artefact is plain Markdown.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  Client (oia.agentics.org)                                           │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Single-page app — React 18 + TypeScript + TailwindCSS       │    │
│  │  Telemetry-dashboard design system (palette-locked)          │    │
│  └──────────────────────────────────────────────────────────────┘    │
└───────────────────────┬──────────────────────────────────────────────┘
                        │
       HTTPS (SNI oia.agentics.org · CORS allow-list)
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│  Static hosting — GitHub Pages (oia.agentics.org)                    │
│                                                                      │
│  Cross-origin fetch ↓ /api/*                                         │
│                                                                      │
│  Cloud Run service  oia-model-reader  (us-central1, Gen 2)           │
│  Node 20 + Express 5 + better-sqlite3                                │
│                                                                      │
│  SQLite volume mount:                                                │
│     gs://agentics-oia-model-data  →  /data/feedback.db               │
└──────────────────────────────────────────────────────────────────────┘
```

**Design references**
- Telemetry UI aesthetic homage — see `animated-telemetry-dashboard-section (1).tsx`
- Palette: `#000000` / `#FFFFFF` / `#F05122` (Agentics orange) — strict
- All visual motion gated behind `IntersectionObserver` and disabled under `prefers-reduced-motion`

---

## Quick Start

### Prerequisites
- Node.js **≥ 20**
- npm **≥ 10**
- For local feedback DB: no setup; the API writes to `data/feedback.db` on first run
- For containerised builds: Docker **≥ 20.10**

### Local development
```bash
git clone https://github.com/agenticsorg/OIA-Model
cd OIA-Model
npm install
npm run dev
```
The SPA and feedback API run together on **http://localhost:5173** via a Vite middleware plugin (`server/vite-api-plugin.ts`).

### Production build (local)
```bash
npm run build        # type-check + Vite build → dist/
npm run server:build # compile server TS → server-dist/
npm run server:start # run dist/ + API on PORT=8080
```

### Container
```bash
docker build --platform=linux/amd64 -t oia-model-reader .
docker run --rm -p 8080:8080 \
  -v $(pwd)/data:/data \
  -e DB_PATH=/data/feedback.db \
  oia-model-reader
```

---

## Deployment

Production runs on Google Cloud Run (Gen 2) in project `agenticsorg`, region `us-central1`.

| Component | Resource |
|-----------|----------|
| Container | `us-central1-docker.pkg.dev/agenticsorg/gcf-artifacts/oia-model-reader` |
| Service   | Cloud Run `oia-model-reader`, `--execution-environment=gen2`, allow-unauthenticated |
| Storage   | `gs://agentics-oia-model-data` mounted at `/data` for SQLite persistence |
| Static    | GitHub Pages (`gh-pages` branch) serving the SPA on `oia.agentics.org` |
| DNS       | Cloudflare CNAME `oia.agentics.org → agenticsorg.github.io` (DNS-only) |
| API CORS  | Allow-list: `oia.agentics.org`, `agenticsorg.github.io`, localhost |

### Redeploy (container only)
```bash
# 1. Build and push new image
TAG="v$(date +%Y%m%d-%H%M)"
IMG="us-central1-docker.pkg.dev/agenticsorg/gcf-artifacts/oia-model-reader:$TAG"
docker build --platform=linux/amd64 -t "$IMG" .
docker push "$IMG"

# 2. Deploy
gcloud run deploy oia-model-reader --image="$IMG" \
  --region=us-central1 --project=agenticsorg
```

### Redeploy (static SPA only)
```bash
export VITE_API_BASE="https://oia-model-reader-2slhzrawja-uc.a.run.app"
npm run build
echo oia.agentics.org > dist/CNAME
cp dist/index.html dist/404.html
# Push dist/ contents to the gh-pages branch
```

---

## Feedback Channel & Queryable Data

Agentics Foundation members submit structured feedback via the **Feedback** section. Submissions are stored in SQLite (`data/feedback.db` locally, `/data/feedback.db` on Cloud Run, backed by GCS).

### Schema (21 columns)
- Identity — optional name / email / organisation / role; `share_name` toggle redacts from public listing
- Foundation-featured prompts — hyperscaler monopolies, L8 certification, legacy vendor mapping, Foundation funding, regulatory alignment
- Review prompts drawn from the digests — shape assessment, decisions to reopen + reasons, open-question contribution, missing concerns / tech / spans, vertical-extension experience, improvements, general notes

### Query from the CLI
```bash
# Human-readable
npm run feedback:list

# Every field, every row
npm run feedback:full

# Arbitrary SELECT (SELECT only; mutations refused)
npm run feedback:query -- "SELECT id, role, substr(shape_response, 1, 120) FROM feedback"

# Sync production DB down for local inspection
gcloud storage cp gs://agentics-oia-model-data/feedback.db ./data/feedback.db
```

---

## Project Layout

```
OIA-Model/
├── src/
│   ├── sections/        14 top-level sections + Workspace + Feedback
│   ├── components/
│   │   ├── viz/         Six SVG figures inline with the digest prose
│   │   └── micro/       13 operator tools (Markdown-artefact generators)
│   ├── content/         Verbatim digest text · layers · spans · refs · decisions
│   ├── lib/             Workspace aggregation + export
│   └── styles/          Telemetry design tokens
├── server/              Production Express app + Vite dev middleware + SQLite
├── scripts/             Feedback CLI (list / full / query)
├── docs/                Source digests (v0.1)
└── plans/               ADR-0001 (the architecture decision record)
```

---

## Contributing

The OIA Model is open for community review. Two paths:

1. **Through the UI** — use the Feedback section on [oia.agentics.org](https://oia.agentics.org). All five Foundation-featured questions and eleven review prompts are structured for machine query.
2. **Through Git** — open a pull request against `main`. Please follow the palette, verbatim-source, and section-structure conventions in [`plans/ADR-0001-oia-model-reader-ui.md`](plans/ADR-0001-oia-model-reader-ui.md).

For substantive architectural disagreement, cite a specific decision number in the form `reopen decision NN, because …` — as the Decision Log Digest itself requests.

---

## Security & Privacy

- The feedback API enforces a CORS allow-list (see `server/handlers.ts`).
- Public listings of feedback redact name, email, and organisation for any submission where the reviewer left **share_name** unchecked. The `listFeedbackPublic()` view enforces this at the SQL level.
- No secrets are stored in the repository. Cloudflare and Google credentials live in Google Secret Manager under the `agenticsorg` project.
- Cloud Run is public (`--allow-unauthenticated`) — please do not submit confidential material. Only review-relevant content should be posted.

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE).

> Copyright © 2026 Agentics Foundation

---

## Acknowledgments

- **Reuven Cohen** — Founder, Agentics Foundation, author of the OIA Model Foreword.
- **Source documents** — the [OIA Model v0.1 Reader's Digest](docs/OIA-Model-v0.1-Digest.md) and the [Decision Log Digest](docs/OIA-Model-v0.1-Decision-Log-Digest.md) are the normative texts this UI renders.
- **Frameworks the model builds on** — ISO/IEC 7498 (OSI), NIST Cybersecurity Framework, MITRE ATT&CK / ATLAS, NIST AI Risk Management Framework, OWASP Top 10 for LLM Applications, ISO/IEC 42001, Model Context Protocol.

---

<div align="center">
<sub>Published by the <b>Agentics Foundation</b> · 2026</sub>
</div>
