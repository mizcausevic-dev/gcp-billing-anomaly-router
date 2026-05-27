# Changelog

## v1.0.0-prod — 2026-05-27

Production-readiness hardening on top of v0.1-shipped.

- Verified all CI gates pass on a clean `npm ci`: lint, typecheck, coverage (97.89% statements / 83.18% branches / 95% functions / 97.89% lines), build, demo, smoke, `npm audit --audit-level=high` (0 vulnerabilities at high/critical).
- Confirmed AGPL-3.0-or-later licensing, `SECURITY.md`, `CODE_OF_CONDUCT.md`, weekly `dependabot.yml` for `npm` + `github-actions`.
- Confirmed CI workflow runs the Node 20 + 22 matrix and the production-status surfaces (CI / License / Deploy badges + `## Production status` block) are intact in the README.
- Live operator surface running at https://billing.kineticgain.com/ via the GitHub Pages deploy rail with HTTPS enforcement enabled.
- No changes to source, README content, docs, or screenshots — those remain the v0.1-shipped surface from the build lane.

## v0.1.0 — 2026-05-30

- Initial release: operator surface for GCP billing anomaly routing and FinOps escalation posture.
- Added a public dashboard surface with overview, billing-lane, anomaly-risks, routing-posture, verification, and docs routes.
- Added prerendered GitHub Pages packaging for `billing.kineticgain.com` with `CNAME`, `robots.txt`, `sitemap.xml`, and OG/meta injection at deploy time.
- Added synthetic README proof screenshots and `docs/KINETIC_GAIN_EMBEDDED.md` tie-back packaging.
- Reads a combined JSON envelope `{ baselines, anomalies }` — each section is optional.
- 9 finding codes covering missing current baselines, stale baselines, budget breaches, spend spikes, idle commitments, unlabeled spend, egress bursts, billing export gaps, and stale routing windows.
- Library API: `analyze(input, opts)` -> `DriftReport`; `toMarkdown(report)` + `toSummary(report)` formatters.
- CLI: `gcp-billing-anomaly-router <export.json>` with `--format json|markdown|summary`, `--now <iso>`, `--stale-after-hours N`, `--fail-on-high`, `--out FILE`.
- Multi-cloud security and cost lane (Wave 12) — opens the GCP billing and FinOps track next to the Microsoft and AWS admin portfolio.
- Node 20/22 CI (lint, typecheck, coverage, build, demo, smoke, prerender, `npm audit`), AGPL-3.0-or-later, Dependabot.
