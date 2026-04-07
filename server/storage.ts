import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";
import {
  experiments,
  doctrines,
  tensions,
  type Experiment,
  type InsertExperiment,
  type Doctrine,
  type InsertDoctrine,
  type Tension,
  type InsertTension,
} from "@shared/schema";

const sqlite = new Database("praxis.db");
const db = drizzle(sqlite);

// Run migrations
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS experiments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trial_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    source TEXT NOT NULL DEFAULT 'manual',
    hypothesis TEXT NOT NULL,
    design TEXT NOT NULL,
    experiment_constraint TEXT NOT NULL DEFAULT '',
    observation TEXT NOT NULL DEFAULT '',
    meaning_extraction TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL,
    completed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS doctrines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    statement TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'emerging',
    source_experiment_ids TEXT NOT NULL DEFAULT '[]',
    notes TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pole_a TEXT NOT NULL,
    pole_b TEXT NOT NULL,
    insight TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    is_primary INTEGER NOT NULL DEFAULT 0,
    strength INTEGER NOT NULL DEFAULT 5,
    created_at INTEGER NOT NULL
  );
`);

export interface IStorage {
  // Experiments
  getExperiments(): Experiment[];
  getExperiment(id: number): Experiment | undefined;
  createExperiment(data: InsertExperiment): Experiment;
  updateExperiment(id: number, data: Partial<InsertExperiment> & { completedAt?: number | null }): Experiment | undefined;
  deleteExperiment(id: number): void;
  getNextTrialNumber(): number;

  // Doctrines
  getDoctrines(): Doctrine[];
  getDoctrine(id: number): Doctrine | undefined;
  createDoctrine(data: InsertDoctrine): Doctrine;
  updateDoctrine(id: number, data: Partial<InsertDoctrine>): Doctrine | undefined;
  deleteDoctrine(id: number): void;

  // Tensions
  getTensions(): Tension[];
  getTension(id: number): Tension | undefined;
  createTension(data: InsertTension): Tension;
  updateTension(id: number, data: Partial<InsertTension>): Tension | undefined;
  deleteTension(id: number): void;
}

class Storage implements IStorage {
  // ── Experiments ──────────────────────────────────────────────────────────

  getExperiments(): Experiment[] {
    return db.select().from(experiments).orderBy(desc(experiments.createdAt)).all();
  }

  getExperiment(id: number): Experiment | undefined {
    return db.select().from(experiments).where(eq(experiments.id, id)).get();
  }

  createExperiment(data: InsertExperiment): Experiment {
    return db.insert(experiments).values({
      ...data,
      createdAt: Date.now(),
    }).returning().get();
  }

  updateExperiment(id: number, data: Partial<InsertExperiment> & { completedAt?: number | null }): Experiment | undefined {
    return db.update(experiments).set(data).where(eq(experiments.id, id)).returning().get();
  }

  deleteExperiment(id: number): void {
    db.delete(experiments).where(eq(experiments.id, id)).run();
  }

  getNextTrialNumber(): number {
    const rows = db.select({ trialNumber: experiments.trialNumber }).from(experiments).all();
    if (rows.length === 0) return 1;
    return Math.max(...rows.map(r => r.trialNumber)) + 1;
  }

  // ── Doctrines ────────────────────────────────────────────────────────────

  getDoctrines(): Doctrine[] {
    return db.select().from(doctrines).orderBy(desc(doctrines.createdAt)).all();
  }

  getDoctrine(id: number): Doctrine | undefined {
    return db.select().from(doctrines).where(eq(doctrines.id, id)).get();
  }

  createDoctrine(data: InsertDoctrine): Doctrine {
    return db.insert(doctrines).values({
      ...data,
      createdAt: Date.now(),
    }).returning().get();
  }

  updateDoctrine(id: number, data: Partial<InsertDoctrine>): Doctrine | undefined {
    return db.update(doctrines).set(data).where(eq(doctrines.id, id)).returning().get();
  }

  deleteDoctrine(id: number): void {
    db.delete(doctrines).where(eq(doctrines.id, id)).run();
  }

  // ── Tensions ─────────────────────────────────────────────────────────────

  getTensions(): Tension[] {
    return db.select().from(tensions).orderBy(desc(tensions.isPrimary), desc(tensions.strength)).all();
  }

  getTension(id: number): Tension | undefined {
    return db.select().from(tensions).where(eq(tensions.id, id)).get();
  }

  createTension(data: InsertTension): Tension {
    return db.insert(tensions).values({
      ...data,
      createdAt: Date.now(),
    }).returning().get();
  }

  updateTension(id: number, data: Partial<InsertTension>): Tension | undefined {
    return db.update(tensions).set(data).where(eq(tensions.id, id)).returning().get();
  }

  deleteTension(id: number): void {
    db.delete(tensions).where(eq(tensions.id, id)).run();
  }
}

export const storage = new Storage();
