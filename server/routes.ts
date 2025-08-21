import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSymptoms } from "./services/gemini";
import { searchNearbyHospitals } from "./services/hospital-search";
import { generateHabitInsight } from "./services/habit-analysis";
import { analyzedrugInteractions, generateMedicationChat } from "./services/drug-interaction";
import { 
  symptomAnalysisSchema, 
  chatMessageSchema, 
  signupSchema, 
  loginSchema 
} from "@shared/schema";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticateToken, 
  optionalAuth, 
  type AuthRequest 
} from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        hashedPassword,
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await comparePassword(validatedData.password, user.hashedPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Hospital search route
  app.post("/api/hospitals/search", async (req, res) => {
    try {
      const { latitude, longitude, radius } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Location coordinates required" });
      }

      const result = await searchNearbyHospitals({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius) || 25000,
      });

      res.json(result);
    } catch (error) {
      console.error("Hospital search error:", error);
      res.status(500).json({ message: "Failed to search hospitals" });
    }
  });
  
  // Analyze symptoms endpoint (with optional auth)
  app.post("/api/analyze", optionalAuth, async (req: AuthRequest, res) => {
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

  // Habit tracking routes
  app.post("/api/habits", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const habitLog = await storage.createHabitLog({
        ...req.body,
        userId,
      });
      res.json(habitLog);
    } catch (error) {
      console.error("Failed to create habit log:", error);
      res.status(500).json({ message: "Failed to save habit log" });
    }
  });

  app.get("/api/habits/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      const logs = await storage.getHabitLogsByUserId(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Failed to fetch habit logs:", error);
      res.status(500).json({ message: "Failed to fetch habit logs" });
    }
  });

  app.post("/api/habits/analyze", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { habitLog } = req.body;
      const userId = req.user!.id;
      
      // Generate AI insight based on habit data
      const insight = await generateHabitInsight(habitLog, userId);
      res.json(insight);
    } catch (error) {
      console.error("Failed to analyze habits:", error);
      res.status(500).json({ message: "Failed to analyze habits" });
    }
  });

  // Drug interaction detection
  app.post("/api/health/drug-interactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { medications, newSymptoms, patientHistory } = req.body;
      const userId = req.user!.id;
      
      const analysis = await analyzedrugInteractions(medications, newSymptoms, patientHistory);
      res.json(analysis);
    } catch (error) {
      console.error("Failed to analyze drug interactions:", error);
      res.status(500).json({ message: "Failed to analyze drug interactions" });
    }
  });

  // Medication chat assistance
  app.post("/api/health/medication-chat", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { medicationName, question } = req.body;
      
      const response = await generateMedicationChat(medicationName, question);
      res.json({ response });
    } catch (error) {
      console.error("Failed to generate medication chat:", error);
      res.status(500).json({ message: "Failed to generate medication response" });
    }
  });

  // Risk prediction analysis
  app.post("/api/health/risk-analysis", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.body;
      
      // Fetch user's habit logs for analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const habitLogs = await storage.getHabitLogsByUserId(userId, startDate, endDate);
      
      // Generate risk predictions based on health data
      const mockPredictions = {
        predictions: [
          {
            condition: "Type 2 Diabetes",
            riskLevel: Math.min(50, Math.max(10, 25 + (habitLogs.length > 0 ? -5 : 10))),
            category: "low",
            factors: [
              { name: "Exercise Level", value: "Regular", impact: "low" },
              { name: "Diet Quality", value: "Good", impact: "low" }
            ],
            prevention: ["Maintain regular exercise", "Continue balanced diet"],
            aiInsight: "Your active lifestyle significantly reduces diabetes risk."
          }
        ]
      };
      
      res.json(mockPredictions);
    } catch (error) {
      console.error("Failed to analyze health risks:", error);
      res.status(500).json({ message: "Failed to analyze health risks" });
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
