import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Health record schema based on the provided JSON structure
export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey(),
  complaint: text("complaint").notNull(),
  symptoms: jsonb("symptoms").$type<string[]>(),
  severity: text("severity"),
  duration: text("duration"),
  onset: text("onset"),
  triggers: text("triggers"),
  relief: text("relief"),
  age: integer("age"),
  sex: text("sex"),
  comorbidities: jsonb("comorbidities").$type<string[]>(),
  riskLevel: text("risk_level"),
  recommendedAction: text("recommended_action"),
  suspectedConditions: jsonb("suspected_conditions").$type<string[]>(),
});

// Chat messages schema
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  content: text("content").notNull(),
  isUser: integer("is_user").notNull().default(0), // 0 for AI, 1 for user
  timestamp: varchar("timestamp").notNull(),
});

// Symptom analysis request schema
export const symptomAnalysisSchema = z.object({
  complaint: z.string().min(1, "Please describe your symptoms"),
  userInfo: z.object({
    age: z.number().min(1).max(150).optional(),
    sex: z.enum(["male", "female", "other"]).optional(),
    existingConditions: z.array(z.string()).optional(),
  }).optional(),
});

// Chat message schema
export const chatMessageSchema = z.object({
  content: z.string().min(1),
  sessionId: z.string().min(1),
  isUser: z.boolean(),
});

// Analysis result type
export const analysisResultSchema = z.object({
  symptoms: z.array(z.string()),
  severity: z.enum(["mild", "moderate", "severe"]),
  duration: z.string(),
  onset: z.string(),
  triggers: z.string(),
  relief: z.string(),
  riskLevel: z.enum(["low", "medium", "emergency"]),
  recommendedAction: z.string(),
  suspectedConditions: z.array(z.object({
    name: z.string(),
    probability: z.enum(["low", "medium", "high"]),
    description: z.string(),
  })),
  medicalDisclaimer: z.string(),
});

export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = typeof healthRecords.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type SymptomAnalysisRequest = z.infer<typeof symptomAnalysisSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
