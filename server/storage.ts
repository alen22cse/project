import { 
  type HealthRecord, 
  type InsertHealthRecord, 
  type ChatMessage, 
  type InsertChatMessage,
  type User,
  type InsertUser,
  type SymptomReport,
  type InsertSymptomReport,
  type AiOutput,
  type InsertAiOutput,
  type HabitLog,
  type InsertHabitLog,
  type DigitalTwin,
  type InsertDigitalTwin,
  type TwinSimulation,
  type InsertTwinSimulation,
  type MultiModalAnalysis,
  type InsertMultiModalAnalysis,
  type SecondOpinion,
  type InsertSecondOpinion,
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface IStorage {
  // User methods
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Health records methods
  getAllHealthRecords(): Promise<HealthRecord[]>;
  getHealthRecordById(id: string): Promise<HealthRecord | undefined>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  
  // Symptom reports methods
  getSymptomReportsByUserId(userId: string): Promise<SymptomReport[]>;
  createSymptomReport(report: InsertSymptomReport): Promise<SymptomReport>;
  
  // AI outputs methods
  getAiOutputByReportId(reportId: string): Promise<AiOutput | undefined>;
  createAiOutput(output: InsertAiOutput): Promise<AiOutput>;
  
  // Habit logs methods
  getHabitLogsByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<HabitLog[]>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  
  // Chat messages methods
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatSession(sessionId: string): Promise<void>;
  
  // Digital Twins methods
  createDigitalTwin(twin: InsertDigitalTwin): Promise<DigitalTwin>;
  getDigitalTwinsByUserId(userId: string): Promise<DigitalTwin[]>;
  getDigitalTwin(id: string): Promise<DigitalTwin | undefined>;
  updateDigitalTwin(id: string, updates: Partial<InsertDigitalTwin>): Promise<DigitalTwin | undefined>;
  
  // Twin Simulations methods
  createTwinSimulation(simulation: InsertTwinSimulation): Promise<TwinSimulation>;
  getTwinSimulations(twinId: string): Promise<TwinSimulation[]>;
  
  // Multi-Modal Analysis methods
  createMultiModalAnalysis(analysis: InsertMultiModalAnalysis): Promise<MultiModalAnalysis>;
  getMultiModalAnalysesByUserId(userId: string): Promise<MultiModalAnalysis[]>;
  
  // Second Opinions methods
  createSecondOpinion(opinion: InsertSecondOpinion): Promise<SecondOpinion>;
  getSecondOpinionsByUserId(userId: string): Promise<SecondOpinion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private healthRecords: Map<string, HealthRecord>;
  private symptomReports: Map<string, SymptomReport>;
  private aiOutputs: Map<string, AiOutput>;
  private habitLogs: Map<string, HabitLog>;
  private chatMessages: Map<string, ChatMessage>;
  private digitalTwins: Map<string, DigitalTwin>;
  private twinSimulations: Map<string, TwinSimulation>;
  private multiModalAnalyses: Map<string, MultiModalAnalysis>;
  private secondOpinions: Map<string, SecondOpinion>;

  constructor() {
    this.users = new Map();
    this.healthRecords = new Map();
    this.symptomReports = new Map();
    this.aiOutputs = new Map();
    this.habitLogs = new Map();
    this.chatMessages = new Map();
    this.digitalTwins = new Map();
    this.twinSimulations = new Map();
    this.multiModalAnalyses = new Map();
    this.secondOpinions = new Map();
    this.loadSyntheticData();
  }

  private async loadSyntheticData() {
    try {
      const dataPath = path.resolve(import.meta.dirname, "..", "attached_assets", "healthwhisper_synthetic_5k_1755763792364.jsonl");
      const data = await fs.promises.readFile(dataPath, 'utf-8');
      const lines = data.trim().split('\n');
      
      for (const line of lines) {
        try {
          const record = JSON.parse(line);
          const healthRecord: HealthRecord = {
            id: record.id,
            complaint: record.complaint,
            symptoms: record.labels.symptoms,
            severity: record.labels.severity,
            duration: record.labels.duration,
            onset: record.labels.onset,
            triggers: record.labels.triggers,
            relief: record.labels.relief,
            age: record.labels.age,
            sex: record.labels.sex,
            comorbidities: record.labels.comorbidities,
            riskLevel: record.labels.risk_level,
            recommendedAction: record.labels.recommended_action,
            suspectedConditions: record.labels.suspected_conditions,
          };
          this.healthRecords.set(record.id, healthRecord);
        } catch (parseError) {
          console.warn('Failed to parse line:', line);
        }
      }
      
      console.log(`Loaded ${this.healthRecords.size} synthetic health records`);
    } catch (error) {
      console.error('Failed to load synthetic data:', error);
    }
  }

  async getAllHealthRecords(): Promise<HealthRecord[]> {
    return Array.from(this.healthRecords.values());
  }

  async getHealthRecordById(id: string): Promise<HealthRecord | undefined> {
    return this.healthRecords.get(id);
  }

  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const id = record.id || randomUUID();
    const healthRecord: HealthRecord = {
      ...record,
      id,
      age: record.age ?? null,
      sex: record.sex ?? null,
      symptoms: record.symptoms ?? null,
      severity: record.severity ?? null,
      duration: record.duration ?? null,
      onset: record.onset ?? null,
      triggers: record.triggers ?? null,
      relief: record.relief ?? null,
      comorbidities: record.comorbidities ?? null,
      riskLevel: record.riskLevel ?? null,
      recommendedAction: record.recommendedAction ?? null,
      suspectedConditions: record.suspectedConditions ?? null,
    };
    this.healthRecords.set(id, healthRecord);
    return healthRecord;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // User methods
  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = user.id || randomUUID();
    const newUser: User = {
      id,
      email: user.email,
      hashedPassword: user.hashedPassword,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      age: user.age || null,
      gender: user.gender || null,
      profileImageUrl: user.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Symptom reports methods
  async getSymptomReportsByUserId(userId: string): Promise<SymptomReport[]> {
    return Array.from(this.symptomReports.values()).filter(
      report => report.userId === userId
    );
  }

  async createSymptomReport(report: InsertSymptomReport): Promise<SymptomReport> {
    const id = report.id || randomUUID();
    const newReport: SymptomReport = {
      id,
      userId: report.userId || null,
      complaint: report.complaint,
      symptoms: report.symptoms || null,
      severity: report.severity || null,
      riskLevel: report.riskLevel || null,
      createdAt: new Date(),
    };
    this.symptomReports.set(id, newReport);
    return newReport;
  }

  // AI outputs methods
  async getAiOutputByReportId(reportId: string): Promise<AiOutput | undefined> {
    const outputs = Array.from(this.aiOutputs.values());
    return outputs.find(output => output.reportId === reportId);
  }

  async createAiOutput(output: InsertAiOutput): Promise<AiOutput> {
    const id = output.id || randomUUID();
    const newOutput: AiOutput = {
      id,
      reportId: output.reportId || null,
      analysisResult: output.analysisResult,
      confidence: output.confidence || null,
      createdAt: new Date(),
    };
    this.aiOutputs.set(id, newOutput);
    return newOutput;
  }

  // Habit logs methods
  async getHabitLogsByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<HabitLog[]> {
    let logs = Array.from(this.habitLogs.values()).filter(
      log => log.userId === userId
    );

    if (startDate || endDate) {
      logs = logs.filter(log => {
        const logDate = new Date(log.date);
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;
        return true;
      });
    }

    return logs;
  }

  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const id = log.id || randomUUID();
    const newLog: HabitLog = {
      id,
      userId: log.userId,
      date: log.date,
      nutrition: log.nutrition || null,
      sleep: log.sleep || null,
      exercise: log.exercise || null,
      medication: log.medication || null,
      mood: log.mood || null,
      createdAt: new Date(),
    };
    this.habitLogs.set(id, newLog);
    return newLog;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = message.id || randomUUID();
    const chatMessage: ChatMessage = {
      id,
      sessionId: message.sessionId,
      userId: message.userId || null,
      content: message.content,
      isUser: message.isUser ?? 0,
      timestamp: message.timestamp || new Date().toISOString(),
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async clearChatSession(sessionId: string): Promise<void> {
    const messagesToDelete = Array.from(this.chatMessages.entries())
      .filter(([_, msg]) => msg.sessionId === sessionId)
      .map(([id]) => id);
    
    messagesToDelete.forEach(id => this.chatMessages.delete(id));
  }

  // Digital Twin methods
  async createDigitalTwin(twin: InsertDigitalTwin): Promise<DigitalTwin> {
    const id = twin.id || randomUUID();
    const newTwin: DigitalTwin = {
      ...twin,
      id,
      predictiveModel: twin.predictiveModel || null,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    this.digitalTwins.set(id, newTwin);
    return newTwin;
  }

  async getDigitalTwinsByUserId(userId: string): Promise<DigitalTwin[]> {
    return Array.from(this.digitalTwins.values()).filter(twin => twin.userId === userId);
  }

  async getDigitalTwin(id: string): Promise<DigitalTwin | undefined> {
    return this.digitalTwins.get(id);
  }

  async updateDigitalTwin(id: string, updates: Partial<InsertDigitalTwin>): Promise<DigitalTwin | undefined> {
    const existing = this.digitalTwins.get(id);
    if (!existing) return undefined;
    
    const updated: DigitalTwin = {
      ...existing,
      ...updates,
      lastUpdated: new Date(),
    };
    this.digitalTwins.set(id, updated);
    return updated;
  }

  // Twin Simulation methods
  async createTwinSimulation(simulation: InsertTwinSimulation): Promise<TwinSimulation> {
    const id = simulation.id || randomUUID();
    const newSimulation: TwinSimulation = {
      ...simulation,
      id,
      results: simulation.results || null,
      createdAt: new Date(),
    };
    this.twinSimulations.set(id, newSimulation);
    return newSimulation;
  }

  async getTwinSimulations(twinId: string): Promise<TwinSimulation[]> {
    return Array.from(this.twinSimulations.values()).filter(sim => sim.twinId === twinId);
  }

  // Multi-Modal Analysis methods
  async createMultiModalAnalysis(analysis: InsertMultiModalAnalysis): Promise<MultiModalAnalysis> {
    const id = analysis.id || randomUUID();
    const newAnalysis: MultiModalAnalysis = {
      ...analysis,
      id,
      textInput: analysis.textInput || null,
      voiceFileUrl: analysis.voiceFileUrl || null,
      imageFileUrl: analysis.imageFileUrl || null,
      extractedData: analysis.extractedData || null,
      aiAnalysis: analysis.aiAnalysis || null,
      createdAt: new Date(),
    };
    this.multiModalAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }

  async getMultiModalAnalysesByUserId(userId: string): Promise<MultiModalAnalysis[]> {
    return Array.from(this.multiModalAnalyses.values()).filter(analysis => analysis.userId === userId);
  }

  // Second Opinion methods
  async createSecondOpinion(opinion: InsertSecondOpinion): Promise<SecondOpinion> {
    const id = opinion.id || randomUUID();
    const newOpinion: SecondOpinion = {
      ...opinion,
      id,
      prescribedMedications: opinion.prescribedMedications || [],
      patientSymptoms: opinion.patientSymptoms || null,
      aiAnalysis: opinion.aiAnalysis || null,
      createdAt: new Date(),
    };
    this.secondOpinions.set(id, newOpinion);
    return newOpinion;
  }

  async getSecondOpinionsByUserId(userId: string): Promise<SecondOpinion[]> {
    return Array.from(this.secondOpinions.values()).filter(opinion => opinion.userId === userId);
  }


  // Helper method to find similar symptoms in dataset
  findSimilarRecords(userSymptoms: string[]): HealthRecord[] {
    const records = Array.from(this.healthRecords.values());
    const similarRecords: { record: HealthRecord; similarity: number }[] = [];

    for (const record of records) {
      if (!record.symptoms) continue;
      
      const recordSymptoms = record.symptoms;
      let matchCount = 0;
      
      for (const userSymptom of userSymptoms) {
        for (const recordSymptom of recordSymptoms) {
          if (userSymptom.toLowerCase().includes(recordSymptom.toLowerCase()) ||
              recordSymptom.toLowerCase().includes(userSymptom.toLowerCase())) {
            matchCount++;
            break;
          }
        }
      }
      
      if (matchCount > 0) {
        const similarity = matchCount / Math.max(userSymptoms.length, recordSymptoms.length);
        similarRecords.push({ record, similarity });
      }
    }

    return similarRecords
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(item => item.record);
  }
}

export const storage = new MemStorage();
