import { describe, expect, test } from "vitest";

import { analyze } from "./analyze.js";
import { toMarkdown, toSummary } from "./format.js";
import { sampleBillingAnomalyPayload } from "./data/sampleBillingAnomalies.js";

describe("format", () => {
  test("renders markdown findings and compact summary", () => {
    const report = analyze(sampleBillingAnomalyPayload, { now: "2026-05-26T12:00:00Z" });

    expect(toMarkdown(report)).toContain("# GCP billing anomaly posture");
    expect(toMarkdown(report)).toContain("| severity | code | subject | message |");
    expect(toSummary(report)).toContain("high");
  });

  test("renders no-findings markdown for clean reports", () => {
    const report = analyze({ baselines: [], anomalies: [] }, { now: "2026-05-26T12:00:00Z" });
    report.findingsList = [];
    report.ok = true;

    expect(toMarkdown(report)).toContain("No findings.");
    expect(toSummary(report)).toContain("(ok)");
  });
});
