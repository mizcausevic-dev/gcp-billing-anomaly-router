import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { BillingAnomalyExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): BillingAnomalyExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as BillingAnomalyExport;

const NOW = "2026-05-30T00:00:00Z";

describe("analyze", () => {
  it("counts baselines and anomalies", () => {
    const report = analyze(fixture("gcp-billing-anomalies.json"), { now: NOW });
    expect(report.baselines).toBe(2);
    expect(report.currentBaselines).toBe(1);
    expect(report.anomalies).toBe(6);
  });

  it("flags missing current baseline as high", () => {
    const report = analyze({ baselines: [], anomalies: [] }, { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "no-current-baseline")?.severity).toBe("high");
  });

  it("flags stale baselines", () => {
    const report = analyze(fixture("gcp-billing-anomalies.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "stale-baseline")?.subjectName).toContain("folders/");
  });

  it("flags budget breaches and spend spikes", () => {
    const report = analyze(fixture("gcp-billing-anomalies.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "budget-breach")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "spend-spike")?.service).toBe("GKE");
  });

  it("flags commitment, allocation, and egress drift", () => {
    const report = analyze(fixture("gcp-billing-anomalies.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "idle-commitment-drift")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "unlabeled-cost-surge")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "egress-burst")).toBeDefined();
  });

  it("flags export gaps and stale routing windows", () => {
    const report = analyze(fixture("gcp-billing-anomalies.json"), { now: NOW, staleRoutingAfterHours: 24 });
    expect(report.findingsList.find((finding) => finding.code === "cost-export-gap")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "stale-routing-window")).toBeDefined();
  });

  it("ok=true on a clean fixture", () => {
    const report = analyze(fixture("gcp-billing-clean.json"), { now: NOW });
    expect(report.ok).toBe(true);
    expect(report.findingsList.filter((finding) => finding.severity === "high")).toEqual([]);
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first", () => {
    const markdown = toMarkdown(analyze(fixture("gcp-billing-anomalies.json"), { now: NOW }));
    expect(markdown).toContain("❌");
    expect(markdown.indexOf("🔴")).toBeLessThan(markdown.indexOf("🟠"));
  });

  it("toSummary emits a one-liner", () => {
    const summary = toSummary(analyze(fixture("gcp-billing-anomalies.json"), { now: NOW }));
    expect(summary).toMatch(/baselines/);
    expect(summary).toMatch(/anomalies/);
  });
});
