// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  anomalyRisks,
  billingLane,
  payload,
  routingPosture,
  summary,
  verification
} from "./services/gcpBillingAnomalyRouterService.js";
import {
  renderAnomalyRisks,
  renderBillingLane,
  renderDocs,
  renderOverview,
  renderRoutingPosture,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5517);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/billing-lane", (_req, res) => res.type("html").send(renderBillingLane()));
app.get("/anomaly-risks", (_req, res) => res.type("html").send(renderAnomalyRisks()));
app.get("/routing-posture", (_req, res) => res.type("html").send(renderRoutingPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/billing-lane", (_req, res) => res.json(billingLane()));
app.get("/api/anomaly-risks", (_req, res) => res.json(anomalyRisks()));
app.get("/api/routing-posture", (_req, res) => res.json(routingPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`GCP Billing Anomaly Router listening on http://${host}:${port}`);
  });
}

export default app;
