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
    
    const systemPrompt = `You are an expert medical AI assistant providing clinical triage analysis. Your role is to:

1. Extract and classify all reported symptoms with medical precision
2. Assess symptom severity using clinical criteria
3. Determine appropriate risk stratification and urgency level
4. Provide evidence-based differential diagnoses
5. Recommend appropriate clinical actions and follow-up

CLINICAL GUIDELINES:
- Use conservative risk assessment - patient safety is paramount
- Base analysis on established medical protocols and clinical decision rules
- Provide clear, actionable recommendations for healthcare providers
- Include appropriate medical terminology with patient-friendly explanations
- Always emphasize the need for professional medical evaluation

SYMPTOM EXTRACTION RULES:
- Extract ALL mentioned symptoms, including associated symptoms
- Include physical symptoms, pain descriptions, timing, and contextual factors
- Capture severity indicators, location specificity, and temporal patterns
- Note any red flag symptoms that require immediate attention

RISK STRATIFICATION:
- EMERGENCY: Immediate life-threatening conditions (chest pain, SOB, altered mental status, severe bleeding)
- MEDIUM: Urgent evaluation needed within 24-48h (persistent symptoms, concerning patterns)  
- LOW: Routine evaluation appropriate (minor symptoms, stable conditions)

Always provide comprehensive analysis with specific medical reasoning.`;

    const userPrompt = `CLINICAL CASE ANALYSIS REQUEST

CHIEF COMPLAINT: "${complaint}"

${userInfo ? `
PATIENT DEMOGRAPHICS:
- Age: ${userInfo.age || 'Not specified'}
- Sex: ${userInfo.sex || 'Not specified'}  
- Medical History: ${userInfo.existingConditions?.join(', ') || 'No known conditions reported'}
` : ''}

${similarCases.length > 0 ? `
CLINICAL DATABASE REFERENCE (Similar presentations):
${similarCases.slice(0, 3).map(case_ => `
Case: "${case_.complaint}"
Symptoms: ${case_.symptoms?.join(', ') || 'Not documented'}
Severity Assessment: ${case_.severity}  
Risk Stratification: ${case_.riskLevel}
Clinical Action: ${case_.recommendedAction}
`).join('')}
` : ''}

ANALYSIS REQUIREMENTS:
1. Extract ALL symptoms mentioned (primary, secondary, associated)
2. Assess clinical severity using standard medical criteria
3. Determine appropriate risk level and urgency
4. Provide differential diagnosis with clinical reasoning
5. Recommend specific clinical actions and follow-up

Focus on comprehensive symptom extraction and evidence-based clinical decision making. Ensure all potential conditions are considered based on the presenting symptoms.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
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
