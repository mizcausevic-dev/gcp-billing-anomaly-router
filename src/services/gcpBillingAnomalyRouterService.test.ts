import { describe, expect, test } from "vitest";

import {
  anomalyRisks,
  billingLane,
  routingPosture,
  summary,
  verification
} from "./gcpBillingAnomalyRouterService.js";

describe("gcpBillingAnomalyRouterService", () => {
  test("summary reflects the sample GCP billing posture", () => {
    expect(summary()).toMatchObject({
      baselines: 2,
      currentBaselines: 1,
      anomalies: 6,
      budgetBreaches: 1,
      allocationDrifts: 1,
      routingEscalations: 6
    });
  });

  test("billing lane stays mapped to owners", () => {
    const lanes = billingLane();
    expect(lanes).toHaveLength(4);
    expect(lanes.some((lane) => lane.lane === "Budget lane" && lane.owner === "Cloud FinOps")).toBe(true);
  });

  test("anomaly risks sort high severity first", () => {
    const risks = anomalyRisks();
    expect(risks[0]?.severity).toBe("high");
    expect(risks.some((risk) => risk.code === "cost-export-gap")).toBe(true);
  });

  test("routing posture and verification stay populated", () => {
    expect(routingPosture()).toHaveLength(4);
    expect(verification().length).toBeGreaterThan(3);
  });
});
