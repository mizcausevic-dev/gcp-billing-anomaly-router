import type { BillingAnomalyExport } from "../types.js";

export const sampleBillingAnomalyPayload: BillingAnomalyExport = {
  baselines: [
    {
      id: "bill-prod-core",
      name: "Prod Core Billing Account",
      scope: "BILLING_ACCOUNT",
      scopePath: "billingAccounts/01AA12-BB34CC-556677",
      billingAccountId: "01AA12-BB34CC-556677",
      baselineStatus: "CURRENT",
      owner: "Cloud FinOps",
      currentMonthSpendUsd: 182430,
      budgetUsd: 165000,
      monthOverMonthChangePct: 23.4,
      unlabeledSpendPct: 3.8,
      collectedAt: "2026-05-30T09:00:00Z"
    },
    {
      id: "bill-growth-labs",
      name: "Growth Labs Projects",
      scope: "FOLDER",
      scopePath: "folders/822109661114",
      billingAccountId: "01AA12-BB34CC-556677",
      baselineStatus: "STALE",
      owner: "Growth Platform",
      currentMonthSpendUsd: 44620,
      budgetUsd: 39000,
      monthOverMonthChangePct: 31.7,
      unlabeledSpendPct: 17.6,
      collectedAt: "2026-05-27T00:10:00Z"
    }
  ],
  anomalies: [
    {
      id: "anom-budget-bq",
      baselineId: "bill-prod-core",
      scope: "BILLING_ACCOUNT",
      scopePath: "billingAccounts/01AA12-BB34CC-556677",
      family: "Budget",
      status: "OPEN",
      service: "BigQuery",
      expectedState: "Monthly spend remains within approved budget runway",
      observedState: "Budget breach open with $17k overrun",
      estimatedImpactUsd: 17430,
      changeWindowHours: 18,
      owner: "Cloud FinOps",
      breaksGuardrail: true,
      affectsForecast: true
    },
    {
      id: "anom-spike-gke",
      baselineId: "bill-growth-labs",
      scope: "PROJECT",
      scopePath: "projects/growth-attribution-prod",
      family: "Service",
      status: "ACKNOWLEDGED",
      service: "GKE",
      expectedState: "Cluster spend stays near normal daily envelope",
      observedState: "Spend spike after unplanned node pool expansion",
      estimatedImpactUsd: 6820,
      changeWindowHours: 12,
      owner: "Platform SRE",
      affectsForecast: true
    },
    {
      id: "anom-allocation-tags",
      baselineId: "bill-growth-labs",
      scope: "FOLDER",
      scopePath: "folders/822109661114",
      family: "Allocation",
      status: "OPEN",
      service: "Shared services",
      expectedState: "Cost labels keep spend attributable by team and service",
      observedState: "Unlabeled spend rose above allocation tolerance",
      estimatedImpactUsd: 3920,
      changeWindowHours: 33,
      owner: "FinOps Operations",
      affectsAllocation: true
    },
    {
      id: "anom-cud-idle",
      baselineId: "bill-prod-core",
      scope: "PROJECT",
      scopePath: "projects/ml-inference-prod",
      family: "Commitment",
      status: "ACKNOWLEDGED",
      service: "Compute Engine",
      expectedState: "Committed use discount coverage stays matched to active fleet",
      observedState: "Idle commitment coverage after workload contraction",
      estimatedImpactUsd: 5210,
      changeWindowHours: 41,
      owner: "Cloud FinOps"
    },
    {
      id: "anom-egress-media",
      baselineId: "bill-prod-core",
      scope: "PROJECT",
      scopePath: "projects/media-router-prod",
      family: "Egress",
      status: "OPEN",
      service: "Cloud CDN",
      expectedState: "Cross-region transfer remains within expected launch envelope",
      observedState: "Egress burst after cache bypass and fallback routing",
      estimatedImpactUsd: 2860,
      changeWindowHours: 27,
      owner: "Edge Platform",
      breaksGuardrail: true
    },
    {
      id: "anom-export-gap",
      baselineId: "bill-growth-labs",
      scope: "PROJECT",
      scopePath: "projects/growth-attribution-prod",
      family: "Exports",
      status: "OPEN",
      service: "Billing Export",
      expectedState: "Billing export lands in BigQuery daily for anomaly and allocation pipelines",
      observedState: "Missing billing export partition for current week",
      estimatedImpactUsd: 0,
      changeWindowHours: 54,
      owner: "Data Platform",
      breaksGuardrail: true,
      affectsAllocation: true,
      affectsForecast: true
    }
  ]
};

export const billingLanePackets = [
  {
    id: "budget-lane",
    lane: "Budget lane",
    owner: "Cloud FinOps",
    focus: "Billing-account overrun and forecast pressure",
    status: "red",
    note: "BigQuery overrun is already burning through the monthly runway.",
    nextAction: "Lock cost review on the top overrun service before the next finance checkpoint."
  },
  {
    id: "service-spike-lane",
    lane: "Service spike lane",
    owner: "Platform SRE",
    focus: "GKE and service-level spend acceleration",
    status: "yellow",
    note: "Spend acceleration is acknowledged but not yet fully routed to remediation.",
    nextAction: "Right-size the cluster change and confirm it no longer breaks forecast."
  },
  {
    id: "allocation-lane",
    lane: "Allocation hygiene lane",
    owner: "FinOps Operations",
    focus: "Labels, showback, and unattributed spend",
    status: "red",
    note: "Unlabeled spend is weakening team-level showback trust.",
    nextAction: "Restore billing labels and backfill cost attribution before month close."
  },
  {
    id: "exports-lane",
    lane: "Export and routing lane",
    owner: "Data Platform",
    focus: "Billing export continuity and anomaly-routing freshness",
    status: "red",
    note: "Missing export partitions are weakening anomaly and allocation pipelines.",
    nextAction: "Restore billing export ingestion and replay missed partitions."
  }
] as const;

export const routingPackets = [
  {
    packetId: "GBR-11",
    lane: "Budget containment packet",
    owner: "Cloud FinOps",
    status: "red",
    completenessScore: 62,
    decisionNote: "Budget overrun is active and needs a service-by-service containment plan.",
    blocker: "Top overrun service owners have not all confirmed rollback or optimization actions.",
    launchWindowHours: 8
  },
  {
    packetId: "GBR-19",
    lane: "Spike triage packet",
    owner: "Platform SRE",
    status: "yellow",
    completenessScore: 74,
    decisionNote: "GKE spike is understood but not fully normalized against the baseline yet.",
    blocker: "Cluster sizing and workload routing still need one clean verification pass.",
    launchWindowHours: 14
  },
  {
    packetId: "GBR-24",
    lane: "Allocation repair packet",
    owner: "FinOps Operations",
    status: "red",
    completenessScore: 58,
    decisionNote: "Unlabeled spend is still blocking reliable showback for the folder.",
    blocker: "Billing labels and ownership backfill are incomplete.",
    launchWindowHours: 12
  },
  {
    packetId: "GBR-31",
    lane: "Export recovery packet",
    owner: "Data Platform",
    status: "red",
    completenessScore: 55,
    decisionNote: "Missing billing export partitions are weakening anomaly routing and forecast trust.",
    blocker: "BigQuery export replay has not completed for the affected project.",
    launchWindowHours: 10
  }
] as const;
