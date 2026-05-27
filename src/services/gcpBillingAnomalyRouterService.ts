// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { billingLanePackets, routingPackets, sampleBillingAnomalyPayload } from "../data/sampleBillingAnomalies.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-30T00:00:00Z";
const report = analyze(sampleBillingAnomalyPayload, {
  now: NOW,
  staleRoutingAfterHours: 24
});

function severityRank(finding: Finding): number {
  return finding.severity === "high"
    ? 0
    : finding.severity === "medium"
      ? 1
      : finding.severity === "low"
        ? 2
        : 3;
}

export function summary() {
  return {
    baselines: report.baselines,
    currentBaselines: report.currentBaselines,
    anomalies: report.anomalies,
    budgetBreaches: report.budgetBreaches,
    allocationDrifts: report.allocationDrifts,
    routingEscalations: report.routingEscalations,
    highFindings: report.findingsList.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Contain the budget breach, normalize the GKE spike, restore billing exports, and backfill allocation labels before calling GCP billing posture healthy."
  };
}

export function billingLane() {
  return billingLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findingsList.filter((finding) => {
      if (lane.id === "budget-lane") {
        return finding.code === "budget-breach";
      }
      if (lane.id === "service-spike-lane") {
        return finding.code === "spend-spike" || finding.code === "idle-commitment-drift" || finding.code === "egress-burst";
      }
      if (lane.id === "allocation-lane") {
        return finding.code === "unlabeled-cost-surge";
      }
      if (lane.id === "exports-lane") {
        return finding.code === "cost-export-gap" || finding.code === "stale-baseline" || finding.code === "stale-routing-window";
      }
      return false;
    }).length
  }));
}

export function anomalyRisks() {
  return [...report.findingsList]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "budget-breach" || finding.code === "idle-commitment-drift"
          ? "Cloud FinOps"
          : finding.code === "spend-spike"
            ? "Platform SRE"
            : finding.code === "unlabeled-cost-surge"
              ? "FinOps Operations"
              : finding.code === "egress-burst"
                ? "Edge Platform"
                : "Data Platform"
    }));
}

export function routingPosture() {
  return routingPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline anomaly analyzer and CLI, not static copy alone.",
    "Billing baselines and anomaly packets are synthetic sample data only; no live GCP billing exports, credentials, or project secrets are published.",
    "The control plane keeps budget, allocation, service-spike, export, and egress anomalies visible for GCP FinOps and platform stakeholders.",
    "This surface demonstrates GCP billing anomaly routing operations, not a generic cloud keyword page.",
    "It complements Azure, Entra, Intune, AWS, and GCP IAM proof with a concrete FinOps and cost-governance lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    billingLane: billingLane(),
    anomalyRisks: anomalyRisks(),
    routingPosture: routingPosture(),
    verification: verification(),
    sample: sampleBillingAnomalyPayload
  };
}
