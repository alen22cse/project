import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSymptoms } from "./services/gemini";
import { symptomAnalysisSchema, chatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze symptoms endpoint
  app.post("/api/analyze-symptoms", async (req, res) => {
    try {
      const data = symptomAnalysisSchema.parse(req.body);
      
      // Get similar records from dataset for context
      const allRecords = await storage.getAllHealthRecords();
      
      // Analyze symptoms using OpenAI
      const analysis = await analyzeSymptoms(data.complaint, data.userInfo, allRecords);
      
      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      
      console.error("Symptom analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze symptoms. Please try again." 
      });
    }
  });

  // Chat messages endpoints
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const data = chatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage({
        content: data.content,
        sessionId: data.sessionId,
        isUser: data.isUser ? 1 : 0,
        timestamp: new Date().toISOString(),
      });
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid message data", 
          errors: error.errors 
        });
      }
      
      console.error("Failed to create chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.delete("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearChatSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to clear chat session:", error);
      res.status(500).json({ message: "Failed to clear chat session" });
    }
  });

  // Get health records for validation (debugging endpoint)
  app.get("/api/health-records", async (req, res) => {
    try {
      const records = await storage.getAllHealthRecords();
      res.json({ 
        total: records.length,
        sample: records.slice(0, 5) // Return first 5 for preview
      });
    } catch (error) {
      console.error("Failed to fetch health records:", error);
      res.status(500).json({ message: "Failed to fetch health records" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
