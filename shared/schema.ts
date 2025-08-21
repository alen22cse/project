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

// Users table with JWT auth support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  hashedPassword: text("hashed_password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Digital Twin profiles table
export const digitalTwins = pgTable("digital_twins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  baselineData: jsonb("baseline_data").$type<{
    age: number;
    weight: number;
    height: number;
    medicalHistory: string[];
    currentMedications: string[];
    allergies: string[];
    lifestyle: {
      sleepHours: number;
      exerciseFrequency: string;
      dietType: string;
      smoking: boolean;
      drinking: string;
    };
  }>().notNull(),
  predictiveModel: jsonb("predictive_model").$type<{
    healthScore: number;
    riskFactors: string[];
    recommendations: string[];
  }>(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Digital Twin simulations table
export const twinSimulations = pgTable("twin_simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  twinId: varchar("twin_id").references(() => digitalTwins.id).notNull(),
  simulationType: varchar("simulation_type").notNull(), // 'sleep', 'diet', 'exercise', etc.
  scenario: jsonb("scenario").$type<{
    changes: Record<string, any>;
    timeframe: string;
  }>().notNull(),
  results: jsonb("results").$type<{
    predictedOutcome: string;
    confidence: number;
    impactScore: number;
    recommendations: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Multi-modal symptom analysis table
export const multiModalAnalysis = pgTable("multimodal_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  analysisType: varchar("analysis_type").notNull(), // 'text', 'voice', 'image', 'combined'
  textInput: text("text_input"),
  voiceFileUrl: varchar("voice_file_url"),
  imageFileUrl: varchar("image_file_url"),
  extractedData: jsonb("extracted_data").$type<{
    symptoms: string[];
    severity: string;
    bodyParts: string[];
    visualFindings?: string[];
    speechAnalysis?: {
      emotionalState: string;
      painLevel: number;
      clarity: string;
    };
  }>(),
  aiAnalysis: jsonb("ai_analysis").$type<{
    diagnosis: string[];
    urgency: string;
    recommendations: string[];
    confidence: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Second opinion analysis table
export const secondOpinions = pgTable("second_opinions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  doctorDiagnosis: text("doctor_diagnosis").notNull(),
  prescribedMedications: jsonb("prescribed_medications").$type<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[]>(),
  patientSymptoms: text("patient_symptoms"),
  aiAnalysis: jsonb("ai_analysis").$type<{
    diagnosisExplanation: string;
    medicationAnalysis: {
      name: string;
      purpose: string;
      sideEffects: string[];
      interactions: string[];
      precautions: string[];
    }[];
    alternativeOptions: string[];
    redFlags: string[];
    questions: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
export const insertDigitalTwinSchema = createInsertSchema(digitalTwins);
export const insertTwinSimulationSchema = createInsertSchema(twinSimulations);
export const insertMultiModalAnalysisSchema = createInsertSchema(multiModalAnalysis);
export const insertSecondOpinionSchema = createInsertSchema(secondOpinions);

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
export type DigitalTwin = typeof digitalTwins.$inferSelect;
export type InsertDigitalTwin = typeof digitalTwins.$inferInsert;
export type TwinSimulation = typeof twinSimulations.$inferSelect;
export type InsertTwinSimulation = typeof twinSimulations.$inferInsert;
export type MultiModalAnalysis = typeof multiModalAnalysis.$inferSelect;
export type InsertMultiModalAnalysis = typeof multiModalAnalysis.$inferInsert;
export type SecondOpinion = typeof secondOpinions.$inferSelect;
export type InsertSecondOpinion = typeof secondOpinions.$inferInsert;
