import { GoogleGenAI } from "@google/genai";
import type { SymptomAnalysisRequest, AnalysisResult, HealthRecord } from "@shared/schema";

// Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeSymptoms(
  complaint: string,
  userInfo?: SymptomAnalysisRequest['userInfo'],
  healthRecords: HealthRecord[] = []
): Promise<AnalysisResult> {
  try {
    // Find similar cases from the dataset for context
    const similarCases = findSimilarCases(complaint, healthRecords);
    
    const systemPrompt = `You are an expert medical AI assistant trained to analyze symptoms and provide triage recommendations. Your role is to:

1. Extract key medical entities from patient descriptions
2. Assess symptom severity and risk level
3. Provide appropriate triage recommendations
4. Suggest possible conditions based on symptoms
5. Always emphasize the importance of professional medical advice

IMPORTANT GUIDELINES:
- Always be conservative in risk assessment - err on the side of caution
- Clearly distinguish between emergency, medium, and low risk situations
- Use medical terminology appropriately but explain in patient-friendly language
- Base recommendations on established medical guidelines
- Always include appropriate medical disclaimers

Respond with a JSON object containing the analysis results. Use this exact structure:
{
  "symptoms": ["array", "of", "extracted", "symptoms"],
  "severity": "mild|moderate|severe",
  "duration": "extracted duration from complaint",
  "onset": "sudden|gradual|chronic",
  "triggers": "identified triggers or 'no clear trigger'",
  "relief": "what provides relief or 'no relief mentioned'",
  "riskLevel": "low|medium|emergency",
  "recommendedAction": "specific recommendation for patient",
  "suspectedConditions": [
    {
      "name": "condition name",
      "probability": "low|medium|high",
      "description": "brief explanation"
    }
  ],
  "medicalDisclaimer": "appropriate disclaimer text"
}`;

    const userPrompt = `Please analyze the following patient complaint and provide a medical assessment:

PATIENT COMPLAINT: "${complaint}"

${userInfo ? `
PATIENT INFORMATION:
- Age: ${userInfo.age || 'Not provided'}
- Sex: ${userInfo.sex || 'Not provided'}
- Existing Conditions: ${userInfo.existingConditions?.join(', ') || 'None reported'}
` : ''}

${similarCases.length > 0 ? `
SIMILAR CASES FROM MEDICAL DATABASE (for reference):
${similarCases.slice(0, 3).map(case_ => `
- Complaint: "${case_.complaint}"
- Symptoms: ${case_.symptoms?.join(', ') || 'N/A'}
- Severity: ${case_.severity}
- Risk Level: ${case_.riskLevel}
- Action: ${case_.recommendedAction}
`).join('')}
` : ''}

RISK LEVEL CRITERIA:
- EMERGENCY: Life-threatening symptoms requiring immediate medical attention (severe chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke symptoms)
- MEDIUM: Symptoms requiring medical evaluation within 24-48 hours (persistent pain, concerning symptoms, symptoms in vulnerable populations)
- LOW: Minor symptoms that can be managed with self-care and monitoring

Please provide a thorough but concise analysis focusing on patient safety and appropriate care recommendations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            symptoms: { type: "array", items: { type: "string" } },
            severity: { type: "string", enum: ["mild", "moderate", "severe"] },
            duration: { type: "string" },
            onset: { type: "string" },
            triggers: { type: "string" },
            relief: { type: "string" },
            riskLevel: { type: "string", enum: ["low", "medium", "emergency"] },
            recommendedAction: { type: "string" },
            suspectedConditions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  probability: { type: "string", enum: ["low", "medium", "high"] },
                  description: { type: "string" }
                },
                required: ["name", "probability", "description"]
              }
            },
            medicalDisclaimer: { type: "string" }
          },
          required: ["symptoms", "severity", "duration", "onset", "triggers", "relief", "riskLevel", "recommendedAction", "suspectedConditions", "medicalDisclaimer"]
        },
      },
      contents: userPrompt,
    });

    const analysisContent = response.text;
    if (!analysisContent) {
      throw new Error("No analysis content received from Gemini");
    }

    let analysis: any;
    try {
      analysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", analysisContent);
      throw new Error("Invalid response format from medical analysis service");
    }

    // Validate and sanitize the response
    const result: AnalysisResult = {
      symptoms: Array.isArray(analysis.symptoms) ? analysis.symptoms : [],
      severity: validateSeverity(analysis.severity),
      duration: analysis.duration || "not specified",
      onset: validateOnset(analysis.onset),
      triggers: analysis.triggers || "no clear trigger",
      relief: analysis.relief || "no relief mentioned",
      riskLevel: validateRiskLevel(analysis.riskLevel),
      recommendedAction: analysis.recommendedAction || "Consult with a healthcare provider for proper evaluation",
      suspectedConditions: validateSuspectedConditions(analysis.suspectedConditions),
      medicalDisclaimer: analysis.medicalDisclaimer || "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment."
    };

    return result;

  } catch (error) {
    console.error("Gemini symptom analysis error:", error);
    
    // Return a safe fallback response
    return {
      symptoms: extractBasicSymptoms(complaint),
      severity: "moderate",
      duration: "not specified",
      onset: "gradual",
      triggers: "no clear trigger",
      relief: "no relief mentioned",
      riskLevel: "medium",
      recommendedAction: "Due to a technical issue with our analysis service, we recommend consulting with a healthcare provider for proper evaluation of your symptoms.",
      suspectedConditions: [],
      medicalDisclaimer: "This analysis service is temporarily unavailable. Please consult with a qualified healthcare provider for proper medical evaluation and advice."
    };
  }
}

function findSimilarCases(complaint: string, healthRecords: HealthRecord[]): HealthRecord[] {
  const complaintWords = complaint.toLowerCase().split(/\s+/);
  const scoredCases: { record: HealthRecord; score: number }[] = [];

  for (const record of healthRecords) {
    let score = 0;
    
    // Score based on complaint similarity
    const recordWords = record.complaint.toLowerCase().split(/\s+/);
    for (const word of complaintWords) {
      if (word.length > 3 && recordWords.some(rw => rw.includes(word) || word.includes(rw))) {
        score += 1;
      }
    }
    
    // Score based on symptom overlap
    if (record.symptoms) {
      for (const symptom of record.symptoms) {
        if (complaintWords.some(word => 
          word.includes(symptom.toLowerCase()) || 
          symptom.toLowerCase().includes(word)
        )) {
          score += 2;
        }
      }
    }
    
    if (score > 0) {
      scoredCases.push({ record, score });
    }
  }

  return scoredCases
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.record);
}

function extractBasicSymptoms(complaint: string): string[] {
  const commonSymptoms = [
    'chest pain', 'headache', 'fever', 'cough', 'shortness of breath', 
    'sore throat', 'nausea', 'vomiting', 'dizziness', 'fatigue',
    'abdominal pain', 'back pain', 'joint pain', 'muscle pain',
    'difficulty breathing', 'rapid heartbeat', 'sweating'
  ];
  
  const lowerComplaint = complaint.toLowerCase();
  return commonSymptoms.filter(symptom => 
    lowerComplaint.includes(symptom)
  );
}

function validateSeverity(severity: any): "mild" | "moderate" | "severe" {
  if (typeof severity === "string" && ["mild", "moderate", "severe"].includes(severity)) {
    return severity as "mild" | "moderate" | "severe";
  }
  return "moderate"; // Default to moderate for safety
}

function validateOnset(onset: any): string {
  if (typeof onset === "string" && ["sudden", "gradual", "chronic"].includes(onset)) {
    return onset;
  }
  return "gradual";
}

function validateRiskLevel(riskLevel: any): "low" | "medium" | "emergency" {
  if (typeof riskLevel === "string" && ["low", "medium", "emergency"].includes(riskLevel)) {
    return riskLevel as "low" | "medium" | "emergency";
  }
  return "medium"; // Default to medium for safety
}

function validateSuspectedConditions(conditions: any): Array<{
  name: string;
  probability: "low" | "medium" | "high";
  description: string;
}> {
  if (!Array.isArray(conditions)) {
    return [];
  }
  
  return conditions
    .filter(condition => 
      condition && 
      typeof condition.name === "string" && 
      typeof condition.description === "string"
    )
    .map(condition => ({
      name: condition.name,
      probability: validateProbability(condition.probability),
      description: condition.description
    }))
    .slice(0, 5); // Limit to 5 conditions
}

function validateProbability(probability: any): "low" | "medium" | "high" {
  if (typeof probability === "string" && ["low", "medium", "high"].includes(probability)) {
    return probability as "low" | "medium" | "high";
  }
  return "low"; // Default to low probability
}
