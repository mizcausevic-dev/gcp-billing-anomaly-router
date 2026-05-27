import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  anomalyRisks,
  billingLane,
  payload,
  routingPosture,
  summary,
  verification
} from "../src/services/gcpBillingAnomalyRouterService.js";
import {
  renderAnomalyRisks,
  renderBillingLane,
  renderDocs,
  renderOverview,
  renderRoutingPosture,
  renderVerification
} from "../src/services/render.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "site");

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, "api", "dashboard"), { recursive: true });
fs.copyFileSync(path.join(root, "CNAME"), path.join(outputDir, "CNAME"));

const pages: Record<string, string> = {
  "index.html": renderOverview(),
  [path.join("billing-lane", "index.html")]: renderBillingLane(),
  [path.join("anomaly-risks", "index.html")]: renderAnomalyRisks(),
  [path.join("routing-posture", "index.html")]: renderRoutingPosture(),
  [path.join("verification", "index.html")]: renderVerification(),
  [path.join("docs", "index.html")]: renderDocs()
};

for (const [relativePath, html] of Object.entries(pages)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, "utf8");
}

const apiPayloads: Record<string, unknown> = {
  [path.join("api", "dashboard", "summary.json")]: summary(),
  [path.join("api", "billing-lane.json")]: billingLane(),
  [path.join("api", "anomaly-risks.json")]: anomalyRisks(),
  [path.join("api", "routing-posture.json")]: routingPosture(),
  [path.join("api", "verification.json")]: verification(),
  [path.join("api", "sample.json")]: payload()
};

for (const [relativePath, data] of Object.entries(apiPayloads)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}
