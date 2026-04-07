import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Experiments ────────────────────────────────────────────────────────────

export const experiments = sqliteTable("experiments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trialNumber: integer("trial_number").notNull(),
  title: text("title").notNull(),
  // 'active' | 'observing' | 'completed' | 'archived'
  status: text("status").notNull().default("active"),
  // 'liminal' | 'parallax' | 'manual'
  source: text("source").notNull().default("manual"),
  hypothesis: text("hypothesis").notNull(),
  design: text("design").notNull(),
  experimentConstraint: text("experiment_constraint").notNull().default(""),
  observation: text("observation").notNull().default(""),
  meaningExtraction: text("meaning_extraction").notNull().default(""),
  tags: text("tags").notNull().default("[]"), // JSON string[]
  createdAt: integer("created_at").notNull(),
  completedAt: integer("completed_at"),
});

export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experiments.$inferSelect;

// ─── Doctrines ──────────────────────────────────────────────────────────────

export const doctrines = sqliteTable("doctrines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  statement: text("statement").notNull(),
  // 'emerging' | 'established' | 'superseded'
  status: text("status").notNull().default("emerging"),
  sourceExperimentIds: text("source_experiment_ids").notNull().default("[]"), // JSON number[]
  notes: text("notes").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});

export const insertDoctrineSchema = createInsertSchema(doctrines).omit({
  id: true,
  createdAt: true,
});

export type InsertDoctrine = z.infer<typeof insertDoctrineSchema>;
export type Doctrine = typeof doctrines.$inferSelect;

// ─── Tensions ───────────────────────────────────────────────────────────────

export const tensions = sqliteTable("tensions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  poleA: text("pole_a").notNull(),
  poleB: text("pole_b").notNull(),
  insight: text("insight").notNull().default(""),
  description: text("description").notNull().default(""),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  strength: integer("strength").notNull().default(5), // 1–10
  createdAt: integer("created_at").notNull(),
});

export const insertTensionSchema = createInsertSchema(tensions).omit({
  id: true,
  createdAt: true,
});

export type InsertTension = z.infer<typeof insertTensionSchema>;
export type Tension = typeof tensions.$inferSelect;
