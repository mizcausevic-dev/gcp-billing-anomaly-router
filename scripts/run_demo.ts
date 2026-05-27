import { anomalyRisks, billingLane, summary } from "../src/services/gcpBillingAnomalyRouterService.js";

console.log("gcp-billing-anomaly-router demo");
console.log(JSON.stringify(summary(), null, 2));
console.log(
  JSON.stringify(
    billingLane().map((lane) => ({
      lane: lane.lane,
      owner: lane.owner,
      status: lane.status
    })),
    null,
    2
  )
);
console.log(JSON.stringify(anomalyRisks().slice(0, 3), null, 2));
