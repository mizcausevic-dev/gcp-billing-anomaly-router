import type { BillingAnomalyExport, BillingBaseline, DriftOptions, DriftReport, Finding } from "./types.js";

function isCurrent(baseline: BillingBaseline): boolean {
  return baseline.baselineStatus === "CURRENT";
}

export function analyze(payload: BillingAnomalyExport, options: DriftOptions = {}): DriftReport {
  const now = options.now ?? new Date().toISOString();
  const staleRoutingAfterHours = options.staleRoutingAfterHours ?? 24;
  const baselines = payload.baselines ?? [];
  const anomalies = payload.anomalies ?? [];
  const findingsList: Finding[] = [];

  const currentBaselines = baselines.filter(isCurrent).length;
  if (currentBaselines === 0) {
    findingsList.push({
      code: "no-current-baseline",
      severity: "high",
      message: "No current GCP billing baseline is available for anomaly routing decisions.",
      subject: "baseline-currentness"
    });
  }

  for (const baseline of baselines) {
    if (baseline.baselineStatus === "STALE") {
      findingsList.push({
        code: "stale-baseline",
        severity: "medium",
        message: `Billing baseline for "${baseline.name}" is stale and should be refreshed before certifying anomaly posture.`,
        subject: baseline.id,
        subjectName: baseline.scopePath,
        scope: baseline.scope
      });
    }
  }

  for (const anomaly of anomalies) {
    const observed = anomaly.observedState.toLowerCase();
    const expected = anomaly.expectedState.toLowerCase();
    if (anomaly.family === "Budget" && anomaly.estimatedImpactUsd >= 5000) {
      findingsList.push({
        code: "budget-breach",
        severity: "high",
        message: `Budget breach on "${anomaly.scopePath}" is already impacting the monthly cloud runway by $${Math.round(anomaly.estimatedImpactUsd).toLocaleString()}.`,
        subject: anomaly.id,
        subjectName: anomaly.scopePath,
        scope: anomaly.scope,
        family: anomaly.family,
        service: anomaly.service
      });
    }

    if (anomaly.family === "Service" && (observed.includes("spike") || anomaly.estimatedImpactUsd >= 3000)) {
      findingsList.push({
        code: "spend-spike",
        severity: anomaly.estimatedImpactUsd >= 7000 ? "high" : "medium",
        message: `Spend spike is active on service "${anomaly.service}" within "${anomaly.scopePath}" and should be routed before forecast confidence slips.`,
        subject: anomaly.id,
        subjectName: anomaly.scopePath,
        scope: anomaly.scope,
        family: anomaly.family,
        service: anomaly.service
      });
    }

    if (anomaly.family === "Commitment" && (observed.includes("idle") || observed.includes("underused"))) {
      findingsList.push({
        code: "idle-commitment-drift",
        severity: "medium",
        message: `Commitment coverage for "${anomaly.scopePath}" is idle or underused and should be rebalanced before savings leak further.`,
        subject: anomaly.id,
        subjectName: anomaly.scopePath,
        scope: anomaly.scope,
        family: anomaly.family,
        service: anomaly.service
      });
    }

    if (anomaly.family === "Allocation" && (observed.includes("unlabeled") || anomaly.affectsAllocation)) {
      findingsList.push({
        code: "unlabeled-cost-surge",
        severity: "medium",
        message: `Allocation hygiene drift is active on "${anomaly.scopePath}" and unlabeled spend is reducing showback trust.`,
        subject: anomaly.id,
        subjectName: anomaly.scopePath,
        scope: anomaly.scope,
        family: anomaly.family,
        service: anomaly.service
      });
    }

    if (anomaly.family === "Egress" && (observed.includes("egress") || anomaly.estimatedImpactUsd >= 2000)) {
      findingsList.push({
        code: "egress-burst",
        severity: anomaly.breaksGuardrail ? "high" : "medium",
        message: `Egress anomaly is active on "${anomaly.scopePath}" and should be reviewed before data-transfer spend keeps compounding.`,
        subject: anomaly.id,
        subjectName: anomaly.scopePath,
        scope: anomaly.scope,
        family: anomaly.family,
        service: anomaly.service
      });
    }

    if (anomaly.family === "Exports" && (observed.includes("missing") || expected.includes("billing export"))) {
      findingsList.push({
        code: "cost-export-gap",
        severity: "high",
        message: `Billing export coverage is broken on "${anomaly.scopePath}", which weakens downstream anomaly detection and allocation trust.`,
        subject: anomaly.id,
        subjectName: anomaly.scopePath,
        scope: anomaly.scope,
        family: anomaly.family,
        service: anomaly.service
      });
    }

    if (anomaly.changeWindowHours > staleRoutingAfterHours) {
      findingsList.push({
        code: "stale-routing-window",
        severity: anomaly.changeWindowHours > staleRoutingAfterHours * 2 ? "medium" : "low",
        message: `Anomaly on "${anomaly.scopePath}" has remained unresolved for ${anomaly.changeWindowHours} hours.`,
        subject: anomaly.id,
        subjectName: anomaly.scopePath,
        scope: anomaly.scope,
        family: anomaly.family,
        service: anomaly.service
      });
    }
  }

  const budgetBreaches = anomalies.filter((anomaly) => anomaly.family === "Budget").length;
  const allocationDrifts = anomalies.filter((anomaly) => anomaly.family === "Allocation").length;
  const routingEscalations = anomalies.filter((anomaly) => anomaly.breaksGuardrail || anomaly.status !== "ROUTED").length;
  const ok = !findingsList.some((finding) => finding.severity === "high");

  return {
    generatedAt: now,
    baselines: baselines.length,
    currentBaselines,
    anomalies: anomalies.length,
    budgetBreaches,
    allocationDrifts,
    routingEscalations,
    findingsList,
    ok
  };
}
