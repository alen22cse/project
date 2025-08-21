import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Symptom reports table
export const symptomReports = pgTable("symptom_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  complaint: text("complaint").notNull(),
  symptoms: jsonb("symptoms").$type<string[]>(),
  severity: varchar("severity", { length: 20 }),
  riskLevel: varchar("risk_level", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI outputs table
export const aiOutputs = pgTable("ai_outputs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").references(() => symptomReports.id),
  analysisResult: jsonb("analysis_result").notNull(),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Habit tracking table
export const habitLogs = pgTable("habit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  nutrition: jsonb("nutrition"), // meals, water intake
  sleep: jsonb("sleep"), // duration, quality
  exercise: jsonb("exercise"), // steps, workouts
  medication: jsonb("medication"), // adherence
  mood: jsonb("mood"), // stress/mood levels
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  userId: varchar("user_id").references(() => users.id),
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

// Authentication schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.number().min(1).max(150).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertUserSchema = createInsertSchema(users);
export const insertSymptomReportSchema = createInsertSchema(symptomReports);
export const insertAiOutputSchema = createInsertSchema(aiOutputs);
export const insertHabitLogSchema = createInsertSchema(habitLogs);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SymptomReport = typeof symptomReports.$inferSelect;
export type InsertSymptomReport = typeof symptomReports.$inferInsert;
export type AiOutput = typeof aiOutputs.$inferSelect;
export type InsertAiOutput = typeof aiOutputs.$inferInsert;
export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = typeof habitLogs.$inferInsert;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = typeof healthRecords.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type SymptomAnalysisRequest = z.infer<typeof symptomAnalysisSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
