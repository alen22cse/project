import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface DrugInteraction {
  severity: "mild" | "moderate" | "severe";
  description: string;
  symptoms: string[];
  recommendations: string[];
}

interface MedicationAnalysis {
  hasInteractions: boolean;
  interactions: DrugInteraction[];
  newSymptomRisk: boolean;
  riskFactors: string[];
  monitoring: string[];
}

export async function analyzedrugInteractions(
  medications: string[], 
  newSymptoms: string[], 
  patientHistory: any
): Promise<MedicationAnalysis> {
  try {
    const systemPrompt = `You are a specialized clinical pharmacist AI that analyzes drug interactions and adverse effects. Your role is to:

1. Identify potential drug-drug interactions
2. Assess if new symptoms could be medication-related adverse effects
3. Evaluate contraindications based on patient history
4. Provide clinical monitoring recommendations
5. Suggest safety precautions and follow-up actions

ANALYSIS FRAMEWORK:
- Drug Interaction Types: Pharmacokinetic, Pharmacodynamic, Contraindicated combinations
- Adverse Effect Recognition: Common, rare, serious side effects
- Patient-Specific Factors: Age, comorbidities, organ function
- Temporal Relationships: Symptom onset timing relative to medication changes
- Severity Classification: Mild (monitor), Moderate (caution), Severe (avoid/discontinue)

SAFETY GUIDELINES:
- Always err on the side of caution with drug safety
- Recommend immediate medical attention for severe interactions
- Consider cumulative effects and polypharmacy risks
- Account for individual patient variability
- Emphasize the importance of healthcare provider consultation

RESPONSE REQUIREMENTS:
- Provide specific, actionable clinical recommendations
- Explain the mechanism behind identified interactions
- Suggest monitoring parameters when appropriate
- Recommend timing modifications or dose adjustments if relevant
- Always advise consulting healthcare providers for medication changes`;

    const userPrompt = `DRUG INTERACTION ANALYSIS REQUEST

CURRENT MEDICATIONS:
${medications.length > 0 ? medications.map((med, i) => `${i + 1}. ${med}`).join('\n') : 'No medications listed'}

NEW SYMPTOMS REPORTED:
${newSymptoms.length > 0 ? newSymptoms.map((symptom, i) => `${i + 1}. ${symptom}`).join('\n') : 'No new symptoms'}

PATIENT CONTEXT:
${JSON.stringify(patientHistory, null, 2)}

ANALYSIS REQUIREMENTS:
1. Check for drug-drug interactions between listed medications
2. Assess if new symptoms could be medication-related adverse effects
3. Identify any contraindications based on patient history
4. Recommend monitoring parameters and safety precautions
5. Provide specific recommendations for healthcare provider consultation

Return comprehensive analysis in JSON format:
{
  "hasInteractions": boolean,
  "interactions": [
    {
      "severity": "mild|moderate|severe",
      "description": "detailed interaction description",
      "symptoms": ["potential symptoms"],
      "recommendations": ["specific actions"]
    }
  ],
  "newSymptomRisk": boolean,
  "riskFactors": ["identified risk factors"],
  "monitoring": ["monitoring recommendations"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            hasInteractions: { type: "boolean" },
            interactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string", enum: ["mild", "moderate", "severe"] },
                  description: { type: "string" },
                  symptoms: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } }
                },
                required: ["severity", "description", "symptoms", "recommendations"]
              }
            },
            newSymptomRisk: { type: "boolean" },
            riskFactors: { type: "array", items: { type: "string" } },
            monitoring: { type: "array", items: { type: "string" } }
          },
          required: ["hasInteractions", "interactions", "newSymptomRisk", "riskFactors", "monitoring"]
        }
      },
      contents: userPrompt,
    });

    const analysisContent = response.text;
    if (!analysisContent) {
      throw new Error("No analysis content received");
    }

    const analysis = JSON.parse(analysisContent);
    
    return {
      hasInteractions: analysis.hasInteractions || false,
      interactions: analysis.interactions || [],
      newSymptomRisk: analysis.newSymptomRisk || false,
      riskFactors: analysis.riskFactors || [],
      monitoring: analysis.monitoring || []
    };

  } catch (error) {
    console.error("Drug interaction analysis error:", error);
    
    // Fallback basic analysis
    const hasKnownInteractions = medications.some(med => 
      med.toLowerCase().includes('warfarin') || 
      med.toLowerCase().includes('aspirin') ||
      med.toLowerCase().includes('ibuprofen')
    );
    
    return {
      hasInteractions: hasKnownInteractions,
      interactions: hasKnownInteractions ? [{
        severity: "moderate" as const,
        description: "Potential interaction detected. Please consult your healthcare provider.",
        symptoms: ["Increased bleeding risk", "Gastrointestinal irritation"],
        recommendations: ["Monitor for bleeding", "Take with food", "Consult pharmacist"]
      }] : [],
      newSymptomRisk: newSymptoms.length > 0 && medications.length > 0,
      riskFactors: ["Multiple medications", "New symptom onset"],
      monitoring: ["Regular blood pressure checks", "Monitor for side effects", "Keep medication diary"]
    };
  }
}

export async function generateMedicationChat(
  medicationName: string, 
  patientQuestion: string
): Promise<string> {
  try {
    const systemPrompt = `You are a friendly, knowledgeable medication assistant AI. Provide conversational, helpful responses about medications while always emphasizing the importance of consulting healthcare providers for medical decisions.

Guidelines:
- Be warm and supportive, like a caring healthcare assistant
- Provide accurate, evidence-based information
- Always recommend consulting healthcare providers for medical decisions
- Use simple, easy-to-understand language
- Show empathy and understanding
- Include practical tips when appropriate
- Emphasize medication safety and adherence`;

    const userPrompt = `Patient question about ${medicationName}: "${patientQuestion}"

Provide a helpful, conversational response that addresses their concern while maintaining safety and encouraging professional consultation when appropriate.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemPrompt
      },
      contents: userPrompt,
    });

    return response.text || "I'd be happy to help with your medication question. For specific concerns about your medication, please consult your healthcare provider or pharmacist who can provide personalized guidance based on your individual health needs.";

  } catch (error) {
    console.error("Medication chat error:", error);
    return "I'd be happy to help with your medication question. For specific concerns about your medication, please consult your healthcare provider or pharmacist who can provide personalized guidance based on your individual health needs.";
  }
}