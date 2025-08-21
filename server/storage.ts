import { type HealthRecord, type InsertHealthRecord, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface IStorage {
  // Health records methods
  getAllHealthRecords(): Promise<HealthRecord[]>;
  getHealthRecordById(id: string): Promise<HealthRecord | undefined>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  
  // Chat messages methods
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatSession(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private healthRecords: Map<string, HealthRecord>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.healthRecords = new Map();
    this.chatMessages = new Map();
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

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = message.id || randomUUID();
    const chatMessage: ChatMessage = {
      ...message,
      id,
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
