import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { requireAuth, getUserId, verifyLumenToken } from "./auth";
import { insertExperimentSchema, insertDoctrineSchema, insertTensionSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(httpServer: Server, app: Express) {
  // ── Auth endpoints ──────────────────────────────────────────────────────

  app.get('/api/auth/sso', async (req: any, res: any) => {
    const { token } = req.query as { token?: string };
    if (!token) return res.status(400).json({ error: 'Missing token' });
    try {
      const payload = verifyLumenToken(token);
      const lumenUserId = String(payload.userId);
      req.session.userId = lumenUserId;
      req.session.username = payload.username;
      req.session.save((err: unknown) => {
        if (err) console.error('[praxis/sso] session save error:', err);
        res.redirect('/#/');
      });
    } catch (err) {
      console.error('[praxis/sso] token error:', err);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/auth/me', (req: any, res: any) => {
    if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ userId: req.session.userId, username: req.session.username });
  });

  app.post('/api/auth/logout', (req: any, res: any) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  // ─── Internal: push from Lumen epistemic queue ───────────────────────────────
  app.post('/api/internal/from-lumen', (req: any, res: any) => {
    const token = req.headers['x-lumen-internal-token'];
    const expected = process.env.JWT_SECRET || '4gLtMuM38OkYGIpM1SCD+QQLgBPqgrKFB3aZeObkaqobhpeFOCV3NkAMW2dyOS17';
    if (!token || token !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      title,
      hypothesis,
      design = 'Auto-generated from epistemic queue. Review and refine to structure your experiment.',
      source = 'liminal',
      status = 'active',
      experimentConstraint = '',
      observation = '',
      meaningExtraction = '',
      tags = '[]',
      userId = '1',
    } = req.body as Record<string, any>;

    if (!hypothesis) {
      return res.status(400).json({ error: 'hypothesis is required' });
    }

    try {
      const trialNumber = storage.getNextTrialNumber(String(userId));
      const experiment = storage.createExperiment(
        {
          title: title || hypothesis.slice(0, 200),
          trialNumber,
          status,
          source,
          hypothesis,
          design,
          experimentConstraint,
          observation,
          meaningExtraction,
          tags,
        },
        String(userId)
      );
      return res.status(201).json(experiment);
    } catch (err: any) {
      console.error('[praxis/internal/from-lumen]', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Auth guard for all /api/* except /api/auth/* ─────────────────────────
  app.use('/api', (req: any, res: any, next: any) => {
    if (req.path.startsWith('/auth/') || req.path === '/health' || req.path.startsWith('/internal/')) return next();
    requireAuth(req, res, next);
  });

  // ── Experiments ────────────────────────────────────────────────────────

  app.get("/api/experiments", (req: any, res: any) => {
    res.json(storage.getExperiments(getUserId(req)));
  });

  app.get("/api/experiments/next-trial", (req: any, res: any) => {
    res.json({ trialNumber: storage.getNextTrialNumber(getUserId(req)) });
  });

  app.get("/api/experiments/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const experiment = storage.getExperiment(id, getUserId(req));
    if (!experiment) return res.status(404).json({ error: "Not found" });
    res.json(experiment);
  });

  app.post("/api/experiments", (req: any, res: any) => {
    const result = insertExperimentSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const experiment = storage.createExperiment(result.data, getUserId(req));
    res.status(201).json(experiment);
  });

  app.patch("/api/experiments/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const partial = insertExperimentSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const body = req.body as Record<string, unknown>;
    const extra: { completedAt?: number | null } = {};
    if ("completedAt" in body) extra.completedAt = body.completedAt as number | null;
    const updated = storage.updateExperiment(id, { ...partial.data, ...extra }, getUserId(req));
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/experiments/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    storage.deleteExperiment(id, getUserId(req));
    res.status(204).end();
  });

  // ── Doctrines ──────────────────────────────────────────────────────────

  app.get("/api/doctrines", (req: any, res: any) => {
    res.json(storage.getDoctrines(getUserId(req)));
  });

  app.get("/api/doctrines/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const doctrine = storage.getDoctrine(id, getUserId(req));
    if (!doctrine) return res.status(404).json({ error: "Not found" });
    res.json(doctrine);
  });

  app.post("/api/doctrines", (req: any, res: any) => {
    const result = insertDoctrineSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const doctrine = storage.createDoctrine(result.data, getUserId(req));
    res.status(201).json(doctrine);
  });

  app.patch("/api/doctrines/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const partial = insertDoctrineSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const updated = storage.updateDoctrine(id, partial.data, getUserId(req));
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/doctrines/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    storage.deleteDoctrine(id, getUserId(req));
    res.status(204).end();
  });

  // ── Tensions ───────────────────────────────────────────────────────────

  app.get("/api/tensions", (req: any, res: any) => {
    res.json(storage.getTensions(getUserId(req)));
  });

  app.get("/api/tensions/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const tension = storage.getTension(id, getUserId(req));
    if (!tension) return res.status(404).json({ error: "Not found" });
    res.json(tension);
  });

  app.post("/api/tensions", (req: any, res: any) => {
    const result = insertTensionSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.flatten() });
    const tension = storage.createTension(result.data, getUserId(req));
    res.status(201).json(tension);
  });

  app.patch("/api/tensions/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    const partial = insertTensionSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const updated = storage.updateTension(id, partial.data, getUserId(req));
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/tensions/:id", (req: any, res: any) => {
    const id = parseInt(req.params.id);
    storage.deleteTension(id, getUserId(req));
    res.status(204).end();
  });

  // ─── Sensitivity proxy → Lumen ──────────────────────────────────────────────
  app.get('/api/settings/sensitivity', async (req: any, res: any) => {
    const LUMEN_API_URL = process.env.LUMEN_API_URL;
    const TOKEN = process.env.LUMEN_INTERNAL_TOKEN;
    const USER_ID = req.session?.userId || process.env.LUMEN_USER_ID || '1';
    if (!LUMEN_API_URL || !TOKEN) return res.json({ sensitivity: 'medium' });
    try {
      const r = await fetch(`${LUMEN_API_URL}/api/epistemic/sensitivity/${USER_ID}`, {
        headers: { 'x-lumen-internal-token': TOKEN },
      });
      if (!r.ok) return res.json({ sensitivity: 'medium' });
      const data = await r.json() as { sensitivity: string };
      return res.json(data);
    } catch {
      return res.json({ sensitivity: 'medium' });
    }
  });

  app.post('/api/settings/sensitivity', async (req: any, res: any) => {
    const LUMEN_API_URL = process.env.LUMEN_API_URL;
    const TOKEN = process.env.LUMEN_INTERNAL_TOKEN;
    const USER_ID = req.session?.userId || process.env.LUMEN_USER_ID || '1';
    const { sensitivity } = req.body as { sensitivity: string };
    if (!LUMEN_API_URL || !TOKEN) return res.json({ sensitivity: sensitivity || 'medium' });
    try {
      const r = await fetch(`${LUMEN_API_URL}/api/epistemic/sensitivity/${USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-lumen-internal-token': TOKEN },
        body: JSON.stringify({ sensitivity }),
      });
      if (!r.ok) return res.json({ sensitivity: sensitivity || 'medium' });
      const data = await r.json() as { sensitivity: string };
      return res.json(data);
    } catch {
      return res.json({ sensitivity: sensitivity || 'medium' });
    }
  });

  // ── Summary ────────────────────────────────────────────────────────────

  app.get("/api/summary", (req: any, res: any) => {
    const uid = getUserId(req);
    const allExperiments = storage.getExperiments(uid);
    const allDoctrines = storage.getDoctrines(uid);
    const allTensions = storage.getTensions(uid);
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
