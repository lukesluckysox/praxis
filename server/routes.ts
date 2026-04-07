import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertExperimentSchema, insertDoctrineSchema, insertTensionSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(httpServer: Server, app: Express) {
  // ── Experiments ────────────────────────────────────────────────────────

  app.get("/api/experiments", (_req, res) => {
    res.json(storage.getExperiments());
  });

  app.get("/api/experiments/next-trial", (_req, res) => {
    res.json({ trialNumber: storage.getNextTrialNumber() });
  });

  app.get("/api/experiments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const experiment = storage.getExperiment(id);
    if (!experiment) return res.status(404).json({ error: "Not found" });
    res.json(experiment);
  });

  app.post("/api/experiments", (req, res) => {
    const result = insertExperimentSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const experiment = storage.createExperiment(result.data);
    res.status(201).json(experiment);
  });

  app.patch("/api/experiments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const partial = insertExperimentSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const body = req.body as Record<string, unknown>;
    const extra: { completedAt?: number | null } = {};
    if ("completedAt" in body) extra.completedAt = body.completedAt as number | null;
    const updated = storage.updateExperiment(id, { ...partial.data, ...extra });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/experiments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteExperiment(id);
    res.status(204).end();
  });

  // ── Doctrines ──────────────────────────────────────────────────────────

  app.get("/api/doctrines", (_req, res) => {
    res.json(storage.getDoctrines());
  });

  app.get("/api/doctrines/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const doctrine = storage.getDoctrine(id);
    if (!doctrine) return res.status(404).json({ error: "Not found" });
    res.json(doctrine);
  });

  app.post("/api/doctrines", (req, res) => {
    const result = insertDoctrineSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const doctrine = storage.createDoctrine(result.data);
    res.status(201).json(doctrine);
  });

  app.patch("/api/doctrines/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const partial = insertDoctrineSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const updated = storage.updateDoctrine(id, partial.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/doctrines/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteDoctrine(id);
    res.status(204).end();
  });

  // ── Tensions ───────────────────────────────────────────────────────────

  app.get("/api/tensions", (_req, res) => {
    res.json(storage.getTensions());
  });

  app.get("/api/tensions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const tension = storage.getTension(id);
    if (!tension) return res.status(404).json({ error: "Not found" });
    res.json(tension);
  });

  app.post("/api/tensions", (req, res) => {
    const result = insertTensionSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const tension = storage.createTension(result.data);
    res.status(201).json(tension);
  });

  app.patch("/api/tensions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const partial = insertTensionSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const updated = storage.updateTension(id, partial.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/tensions/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteTension(id);
    res.status(204).end();
  });

  // ── Summary ────────────────────────────────────────────────────────────

  app.get("/api/summary", (_req, res) => {
    const allExperiments = storage.getExperiments();
    const allDoctrines = storage.getDoctrines();
    const allTensions = storage.getTensions();
    res.json({
      experiments: {
        total: allExperiments.length,
        active: allExperiments.filter(e => e.status === "active").length,
        observing: allExperiments.filter(e => e.status === "observing").length,
        completed: allExperiments.filter(e => e.status === "completed").length,
      },
      doctrines: {
        total: allDoctrines.length,
        emerging: allDoctrines.filter(d => d.status === "emerging").length,
        established: allDoctrines.filter(d => d.status === "established").length,
      },
      tensions: {
        total: allTensions.length,
        primary: allTensions.find(t => t.isPrimary),
      },
    });
  });
}
