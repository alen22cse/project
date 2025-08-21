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
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  },
});

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

  // ========== DIGITAL TWIN ROUTES ==========
  
  app.get("/api/digital-twins", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const twins = await storage.getDigitalTwinsByUserId(req.user!.id);
      
      // Generate health scores and predictions for each twin
      const enrichedTwins = await Promise.all(twins.map(async (twin) => {
        if (!twin.predictiveModel) {
          const prediction = await generateTwinPredictions(twin);
          await storage.updateDigitalTwin(twin.id, { predictiveModel: prediction });
          return { ...twin, predictiveModel: prediction };
        }
        return twin;
      }));
      
      res.json(enrichedTwins);
    } catch (error) {
      console.error("Failed to get digital twins:", error);
      res.status(500).json({ message: "Failed to get digital twins" });
    }
  });
  
  app.post("/api/digital-twins", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const twinData = {
        ...req.body,
        userId: req.user!.id,
      };
      
      const twin = await storage.createDigitalTwin(twinData);
      
      // Generate initial predictive model
      const prediction = await generateTwinPredictions(twin);
      const updatedTwin = await storage.updateDigitalTwin(twin.id, { predictiveModel: prediction });
      
      res.status(201).json(updatedTwin);
    } catch (error) {
      console.error("Failed to create digital twin:", error);
      res.status(500).json({ message: "Failed to create digital twin" });
    }
  });
  
  app.get("/api/digital-twins/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const twin = await storage.getDigitalTwin(req.params.id);
      if (!twin || twin.userId !== req.user!.id) {
        return res.status(404).json({ message: "Digital twin not found" });
      }
      res.json(twin);
    } catch (error) {
      console.error("Failed to get digital twin:", error);
      res.status(500).json({ message: "Failed to get digital twin" });
    }
  });

  // ========== TWIN SIMULATION ROUTES ==========
  
  app.get("/api/twin-simulations/:twinId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const twin = await storage.getDigitalTwin(req.params.twinId);
      if (!twin || twin.userId !== req.user!.id) {
        return res.status(404).json({ message: "Digital twin not found" });
      }
      
      const simulations = await storage.getTwinSimulations(req.params.twinId);
      res.json(simulations);
    } catch (error) {
      console.error("Failed to get twin simulations:", error);
      res.status(500).json({ message: "Failed to get twin simulations" });
    }
  });
  
  app.post("/api/twin-simulations/:twinId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const twin = await storage.getDigitalTwin(req.params.twinId);
      if (!twin || twin.userId !== req.user!.id) {
        return res.status(404).json({ message: "Digital twin not found" });
      }
      
      const simulationData = {
        ...req.body,
        twinId: req.params.twinId,
      };
      
      // Run AI simulation
      const results = await runTwinSimulation(twin, simulationData);
      simulationData.results = results;
      
      const simulation = await storage.createTwinSimulation(simulationData);
      res.status(201).json(simulation);
    } catch (error) {
      console.error("Failed to create twin simulation:", error);
      res.status(500).json({ message: "Failed to create twin simulation" });
    }
  });

  // ========== MULTI-MODAL ANALYSIS ROUTES ==========
  
  app.get("/api/multimodal-analysis", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const analyses = await storage.getMultiModalAnalysesByUserId(req.user!.id);
      res.json(analyses);
    } catch (error) {
      console.error("Failed to get multimodal analyses:", error);
      res.status(500).json({ message: "Failed to get multimodal analyses" });
    }
  });
  
  app.post("/api/multimodal-analysis/text", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { textInput } = req.body;
      
      // Process text with AI
      const extractedData = await extractSymptomsFromText(textInput);
      const aiAnalysis = await analyzeExtractedSymptoms(extractedData);
      
      const analysis = await storage.createMultiModalAnalysis({
        userId: req.user!.id,
        analysisType: "text",
        textInput,
        extractedData,
        aiAnalysis,
      });
      
      res.status(201).json(analysis);
    } catch (error) {
      console.error("Failed to analyze text:", error);
      res.status(500).json({ message: "Failed to analyze text" });
    }
  });
  
  app.post("/api/multimodal-analysis/voice", authenticateToken, upload.single('audio'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file required" });
      }
      
      // Process voice with speech-to-text and emotion analysis
      const voiceAnalysis = await processVoiceRecording(req.file.buffer);
      const aiAnalysis = await analyzeExtractedSymptoms(voiceAnalysis.extractedData);
      
      const analysis = await storage.createMultiModalAnalysis({
        userId: req.user!.id,
        analysisType: "voice",
        voiceFileUrl: "voice_processed", // In production, save to cloud storage
        extractedData: voiceAnalysis.extractedData,
        aiAnalysis,
      });
      
      res.status(201).json(analysis);
    } catch (error) {
      console.error("Failed to analyze voice:", error);
      res.status(500).json({ message: "Failed to analyze voice" });
    }
  });
  
  app.post("/api/multimodal-analysis/image", authenticateToken, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file required" });
      }
      
      // Process image with computer vision
      const imageAnalysis = await processImageForSymptoms(req.file.buffer);
      const aiAnalysis = await analyzeExtractedSymptoms(imageAnalysis.extractedData);
      
      const analysis = await storage.createMultiModalAnalysis({
        userId: req.user!.id,
        analysisType: "image",
        imageFileUrl: "image_processed", // In production, save to cloud storage
        extractedData: imageAnalysis.extractedData,
        aiAnalysis,
      });
      
      res.status(201).json(analysis);
    } catch (error) {
      console.error("Failed to analyze image:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // ========== SECOND OPINION ROUTES ==========
  
  app.get("/api/second-opinions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const opinions = await storage.getSecondOpinionsByUserId(req.user!.id);
      res.json(opinions);
    } catch (error) {
      console.error("Failed to get second opinions:", error);
      res.status(500).json({ message: "Failed to get second opinions" });
    }
  });
  
  // Delete routes for history management
  app.delete("/api/multimodal-analysis/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.deleteMultiModalAnalysis(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete multimodal analysis:", error);
      res.status(500).json({ message: "Failed to delete analysis" });
    }
  });

  app.delete("/api/digital-twins/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.deleteDigitalTwin(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete digital twin:", error);
      res.status(500).json({ message: "Failed to delete twin" });
    }
  });

  app.delete("/api/second-opinions/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.deleteSecondOpinion(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete second opinion:", error);
      res.status(500).json({ message: "Failed to delete opinion" });
    }
  });

  app.post("/api/second-opinions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { doctorDiagnosis, prescribedMedications, patientSymptoms } = req.body;
      
      // Generate AI second opinion
      const aiAnalysis = await generateSecondOpinion({
        diagnosis: doctorDiagnosis,
        medications: prescribedMedications || [],
        symptoms: patientSymptoms,
      });
      
      const opinion = await storage.createSecondOpinion({
        userId: req.user!.id,
        doctorDiagnosis,
        prescribedMedications: prescribedMedications || [],
        patientSymptoms,
        aiAnalysis,
      });
      
      res.status(201).json(opinion);
    } catch (error) {
      console.error("Failed to create second opinion:", error);
      res.status(500).json({ message: "Failed to create second opinion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// ========== HELPER FUNCTIONS FOR AI PROCESSING ==========

async function generateTwinPredictions(twin: any) {
  const { baselineData } = twin;
  
  // Calculate health score based on lifestyle factors
  let healthScore = 70; // Base score
  
  // Sleep impact
  if (baselineData.lifestyle.sleepHours >= 7 && baselineData.lifestyle.sleepHours <= 9) {
    healthScore += 10;
  } else if (baselineData.lifestyle.sleepHours < 6) {
    healthScore -= 15;
  }
  
  // Exercise impact
  const exerciseScores: { [key: string]: number } = {
    "sedentary": -10,
    "light": -5,
    "moderate": 10,
    "active": 15,
    "very_active": 20
  };
  healthScore += exerciseScores[baselineData.lifestyle.exerciseFrequency] || 0;
  
  // Diet impact
  const dietScores: { [key: string]: number } = {
    "balanced": 10,
    "mediterranean": 15,
    "vegetarian": 8,
    "keto": 5,
    "high_protein": 5,
    "low_carb": 3
  };
  healthScore += dietScores[baselineData.lifestyle.dietType] || 0;
  
  // Smoking and drinking impact
  if (baselineData.lifestyle.smoking) {
    healthScore -= 20;
  }
  
  const drinkingPenalty: { [key: string]: number } = {
    "never": 5,
    "occasionally": 0,
    "socially": -2,
    "regularly": -10,
    "daily": -15
  };
  healthScore += drinkingPenalty[baselineData.lifestyle.drinking] || 0;
  
  // Age impact
  if (baselineData.age > 65) {
    healthScore -= 5;
  } else if (baselineData.age < 30) {
    healthScore += 5;
  }
  
  // Cap between 0-100
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Generate risk factors
  const riskFactors = [];
  if (baselineData.lifestyle.sleepHours < 7) riskFactors.push("Sleep deprivation");
  if (baselineData.lifestyle.exerciseFrequency === "sedentary") riskFactors.push("Sedentary lifestyle");
  if (baselineData.lifestyle.smoking) riskFactors.push("Smoking");
  if (baselineData.lifestyle.drinking === "daily") riskFactors.push("Daily alcohol consumption");
  if (baselineData.medicalHistory.length > 0) riskFactors.push("Pre-existing conditions");
  
  // Generate recommendations
  const recommendations = [];
  if (baselineData.lifestyle.sleepHours < 7) {
    recommendations.push("Increase sleep to 7-9 hours nightly for better health outcomes");
  }
  if (baselineData.lifestyle.exerciseFrequency === "sedentary") {
    recommendations.push("Add 30 minutes of moderate exercise 3-4 times per week");
  }
  if (baselineData.lifestyle.smoking) {
    recommendations.push("Consider smoking cessation programs to significantly improve health");
  }
  
  return {
    healthScore,
    riskFactors,
    recommendations
  };
}

async function runTwinSimulation(twin: any, simulationData: any) {
  const { simulationType, scenario } = simulationData;
  const { baselineData } = twin;
  
  let impactScore = 0;
  let predictedOutcome = "";
  let recommendations = [];
  
  switch (simulationType) {
    case "sleep":
      const sleepChange = scenario.changes.sleepHours - baselineData.lifestyle.sleepHours;
      impactScore = sleepChange * 3; // Each hour of sleep = 3 health points
      
      if (sleepChange > 0) {
        predictedOutcome = `Increasing sleep by ${sleepChange} hours could improve your energy levels by ${Math.abs(impactScore)}% and enhance cognitive function within ${scenario.timeframe}.`;
        recommendations = [
          "Establish a consistent bedtime routine",
          "Limit screen time 1 hour before bed",
          "Keep bedroom cool and dark"
        ];
      } else {
        predictedOutcome = `Reducing sleep by ${Math.abs(sleepChange)} hours could decrease your energy by ${Math.abs(impactScore)}% and impair immune function within ${scenario.timeframe}.`;
        recommendations = [
          "Prioritize sleep as essential for health",
          "Identify and eliminate sleep disruptors"
        ];
      }
      break;
      
    case "exercise":
      impactScore = 12; // Exercise generally has positive impact
      predictedOutcome = `Adding regular exercise could improve cardiovascular health by 15% and increase energy levels within ${scenario.timeframe}.`;
      recommendations = [
        "Start with 20 minutes of walking daily",
        "Progress to 150 minutes of moderate activity weekly",
        "Include strength training 2x per week"
      ];
      break;
      
    case "diet":
      impactScore = 8;
      predictedOutcome = `Improving diet quality could reduce inflammation by 20% and stabilize energy levels within ${scenario.timeframe}.`;
      recommendations = [
        "Increase vegetable intake to 5-7 servings daily",
        "Choose whole grains over refined carbs",
        "Limit processed foods and added sugars"
      ];
      break;
      
    default:
      impactScore = 5;
      predictedOutcome = `This lifestyle change could have a moderate positive impact on your overall health within ${scenario.timeframe}.`;
      recommendations = ["Consult with healthcare provider for personalized advice"];
  }
  
  return {
    predictedOutcome,
    confidence: 75 + Math.random() * 20, // 75-95% confidence
    impactScore,
    recommendations
  };
}

async function extractSymptomsFromText(text: string) {
  // Simple NLP extraction - in production, use advanced NLP
  const commonSymptoms = [
    "headache", "fever", "cough", "fatigue", "nausea", "dizziness", "pain",
    "swelling", "rash", "shortness of breath", "chest pain", "abdominal pain",
    "joint pain", "muscle aches", "sore throat", "runny nose", "congestion"
  ];
  
  const bodyParts = [
    "head", "neck", "chest", "abdomen", "back", "arm", "leg", "hand", "foot",
    "shoulder", "knee", "hip", "ankle", "wrist", "elbow", "throat", "eye", "ear"
  ];
  
  const severityKeywords = {
    mild: ["mild", "slight", "minor", "little"],
    moderate: ["moderate", "noticeable", "uncomfortable"],
    severe: ["severe", "intense", "unbearable", "extreme", "terrible", "excruciating"]
  };
  
  const lowerText = text.toLowerCase();
  
  // Extract symptoms
  const symptoms = commonSymptoms.filter(symptom => 
    lowerText.includes(symptom)
  );
  
  // Extract body parts
  const affectedBodyParts = bodyParts.filter(part =>
    lowerText.includes(part)
  );
  
  // Determine severity
  let severity = "mild";
  for (const [level, keywords] of Object.entries(severityKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      severity = level;
      break;
    }
  }
  
  return {
    symptoms,
    severity,
    bodyParts: affectedBodyParts,
  };
}

async function processVoiceRecording(audioBuffer: Buffer) {
  // Mock voice processing - in production, use speech-to-text API
  const mockTranscription = "I have been having headaches for three days with nausea";
  
  const extractedData = await extractSymptomsFromText(mockTranscription);
  
  // Add speech analysis
  (extractedData as any).speechAnalysis = {
    emotionalState: "concerned",
    painLevel: 6,
    clarity: "clear"
  };
  
  return { extractedData };
}

async function processImageForSymptoms(imageBuffer: Buffer) {
  // Mock image processing - in production, use computer vision API
  const mockFindings = ["redness", "swelling", "discoloration"];
  
  return {
    extractedData: {
      symptoms: ["rash"],
      severity: "moderate",
      bodyParts: ["skin"],
      visualFindings: mockFindings
    }
  };
}

async function analyzeExtractedSymptoms(extractedData: any) {
  const { symptoms, severity, bodyParts } = extractedData;
  
  // Generate mock diagnosis suggestions
  const possibleConditions = [];
  
  if (symptoms.includes("headache") && symptoms.includes("nausea")) {
    possibleConditions.push("Migraine");
    possibleConditions.push("Tension headache");
  }
  
  if (symptoms.includes("fever") && symptoms.includes("cough")) {
    possibleConditions.push("Upper respiratory infection");
    possibleConditions.push("Influenza");
  }
  
  // Determine urgency
  let urgency = "low";
  if (severity === "severe" || symptoms.includes("chest pain") || symptoms.includes("shortness of breath")) {
    urgency = "urgent";
  } else if (severity === "moderate") {
    urgency = "moderate";
  }
  
  const recommendations = [
    "Monitor symptoms closely",
    "Stay hydrated and rest",
    "Consult healthcare provider if symptoms worsen",
    urgency === "urgent" ? "Seek immediate medical attention" : "Consider over-the-counter pain relief if appropriate"
  ].filter(Boolean);
  
  return {
    diagnosis: possibleConditions.length > 0 ? possibleConditions : ["Symptom requires further evaluation"],
    urgency,
    recommendations,
    confidence: 70 + Math.random() * 25 // 70-95%
  };
}

async function generateSecondOpinion(data: { diagnosis: string; medications: any[]; symptoms?: string }) {
  const { diagnosis, medications, symptoms } = data;
  
  // Generate explanation for diagnosis
  const diagnosisExplanation = `${diagnosis} is a condition that affects patients through various mechanisms. The diagnosis appears to align with the presented symptoms, though additional testing may provide more certainty.`;
  
  // Analyze each medication
  const medicationAnalysis = medications.map(med => {
    const commonSideEffects = ["nausea", "dizziness", "drowsiness", "dry mouth", "headache"];
    const commonInteractions = ["alcohol", "blood thinners", "other pain medications"];
    const commonPrecautions = ["Take with food", "Avoid driving if drowsy", "Monitor for allergic reactions"];
    
    return {
      name: med.name,
      purpose: `Prescribed to treat symptoms related to ${diagnosis}`,
      sideEffects: commonSideEffects.slice(0, 2 + Math.floor(Math.random() * 3)),
      interactions: commonInteractions.slice(0, 1 + Math.floor(Math.random() * 2)),
      precautions: commonPrecautions.slice(0, 2 + Math.floor(Math.random() * 2))
    };
  });
  
  // Generate alternative options
  const alternativeOptions = [
    "Physical therapy and lifestyle modifications",
    "Alternative medications with fewer side effects",
    "Non-pharmacological treatment approaches",
    "Specialist consultation for second opinion"
  ];
  
  // Generate red flags
  const redFlags = [
    "Severe or worsening symptoms despite treatment",
    "Unusual side effects from medications",
    "Symptoms not improving within expected timeframe",
    "Development of new, concerning symptoms"
  ];
  
  // Generate questions for doctor
  const questions = [
    `What is the expected timeline for improvement with this treatment plan?`,
    `Are there alternative treatments with fewer side effects?`,
    `What specific symptoms should prompt immediate medical attention?`,
    `How will we monitor the effectiveness of this treatment?`,
    `Are there lifestyle changes that could support the treatment?`
  ];
  
  return {
    diagnosisExplanation,
    medicationAnalysis,
    alternativeOptions,
    redFlags,
    questions
  };
}
