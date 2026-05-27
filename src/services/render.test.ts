import { describe, expect, test } from "vitest";

import {
  renderAnomalyRisks,
  renderBillingLane,
  renderDocs,
  renderOverview,
  renderRoutingPosture,
  renderVerification
} from "./render.js";

describe("render", () => {
  test("overview carries the GCP billing control-plane framing", () => {
    expect(renderOverview()).toContain("GCP billing anomalies");
  });

  test("secondary routes render their headings", () => {
    expect(renderBillingLane()).toContain("Billing Lane");
    expect(renderAnomalyRisks()).toContain("Anomaly Risks");
    expect(renderRoutingPosture()).toContain("Routing Posture");
    expect(renderVerification()).toContain("Verification");
    expect(renderDocs()).toContain("Offline billing anomaly analysis");
  });
});
