// Operator surface for GCP billing baselines and anomaly-routing posture.
//
// Inputs reflect exported or captured GCP billing posture:
//   - billing baseline snapshots
//   - anomaly events across budget, allocation, commitment, egress, and export controls

export type ScopeKind = "BILLING_ACCOUNT" | "FOLDER" | "PROJECT";
export type BaselineStatus = "CURRENT" | "STALE";
export type DriftStatus = "OPEN" | "ACKNOWLEDGED" | "ROUTED";
export type AnomalyFamily = "Budget" | "Allocation" | "Commitment" | "Egress" | "Exports" | "Service";

export interface BillingBaseline {
  id: string;
  name: string;
  scope: ScopeKind;
  scopePath: string;
  billingAccountId: string;
  baselineStatus: BaselineStatus;
  owner: string;
  currentMonthSpendUsd: number;
  budgetUsd: number;
  monthOverMonthChangePct: number;
  unlabeledSpendPct: number;
  collectedAt: string;
}

export interface BillingAnomaly {
  id: string;
  baselineId: string;
  scope: ScopeKind;
  scopePath: string;
  family: AnomalyFamily;
  status: DriftStatus;
  service: string;
  expectedState: string;
  observedState: string;
  estimatedImpactUsd: number;
  changeWindowHours: number;
  owner: string;
  breaksGuardrail?: boolean;
  affectsForecast?: boolean;
  affectsAllocation?: boolean;
  note?: string;
}

export interface BillingAnomalyExport {
  baselines?: BillingBaseline[];
  anomalies?: BillingAnomaly[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-current-baseline"
  | "stale-baseline"
  | "budget-breach"
  | "spend-spike"
  | "idle-commitment-drift"
  | "unlabeled-cost-surge"
  | "egress-burst"
  | "cost-export-gap"
  | "stale-routing-window";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  subject: string;
  subjectName?: string;
  scope?: ScopeKind;
  family?: AnomalyFamily;
  service?: string;
}

export interface DriftReport {
  generatedAt: string;
  baselines: number;
  currentBaselines: number;
  anomalies: number;
  budgetBreaches: number;
  allocationDrifts: number;
  routingEscalations: number;
  findingsList: Finding[];
  ok: boolean;
}

export interface DriftOptions {
  now?: string;
  staleRoutingAfterHours?: number;
}
