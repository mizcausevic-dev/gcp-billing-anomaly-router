import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "./app.js";

describe("app", () => {
  test("serves overview and docs", async () => {
    const overview = await request(app).get("/");
    expect(overview.status).toBe(200);
    expect(overview.text).toContain("GCP billing anomalies");

    const docs = await request(app).get("/docs");
    expect(docs.status).toBe(200);
    expect(docs.text).toContain("Offline billing anomaly analysis");
  });

  test("serves summary and sample apis", async () => {
    const summary = await request(app).get("/api/dashboard/summary");
    expect(summary.status).toBe(200);
    expect(summary.body.baselines).toBe(2);

    const sample = await request(app).get("/api/sample");
    expect(sample.status).toBe(200);
    expect(sample.body.sample.baselines).toHaveLength(2);
  });

  test("serves every dashboard route and api route", async () => {
    for (const route of ["/billing-lane", "/anomaly-risks", "/routing-posture", "/verification"]) {
      const response = await request(app).get(route);
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    }

    for (const route of ["/api/billing-lane", "/api/anomaly-risks", "/api/routing-posture", "/api/verification"]) {
      const response = await request(app).get(route);
      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
    }
  });
});
