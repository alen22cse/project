import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface HabitInsight {
  message: string;
  type: "positive" | "warning" | "suggestion";
  score: number;
}

export async function generateHabitInsight(habitLog: any, userId: string): Promise<HabitInsight> {
  try {
    const systemPrompt = `You are a specialized health coach AI that analyzes daily habits and provides personalized insights. Your role is to:

1. Analyze the user's daily health habits comprehensively
2. Identify patterns, strengths, and areas for improvement
3. Provide actionable, encouraging feedback
4. Generate a health score based on multiple factors
5. Suggest specific improvements tailored to the user's lifestyle

ANALYSIS FRAMEWORK:
- Sleep: Quality, duration, consistency patterns
- Nutrition: Meal frequency, timing, satisfaction levels
- Exercise: Activity levels, consistency, variety
- Hydration: Water intake adequacy
- Mental Health: Stress levels, mood patterns
- Medication: Adherence and timing

INSIGHT GUIDELINES:
- Be encouraging and supportive, not judgmental
- Provide specific, actionable recommendations
- Acknowledge positive habits and progress
- Suggest realistic improvements
- Consider interconnections between habits (sleep affects exercise, nutrition affects mood, etc.)

RESPONSE TYPES:
- "positive": Celebrating good habits and encouraging continuation
- "warning": Gentle alerts about concerning patterns that need attention
- "suggestion": Constructive advice for improvement with specific actions`;

    const userPrompt = `DAILY HABIT ANALYSIS REQUEST

HABIT DATA:
Sleep: ${habitLog.sleep?.hours || 'Not logged'} hours, Quality: ${habitLog.sleep?.quality || 'Not rated'}/10
${habitLog.sleep?.snoring ? 'Experienced snoring' : ''}
${habitLog.sleep?.stressRelated ? 'Sleep affected by stress' : ''}

Nutrition: ${habitLog.nutrition?.meals?.length || 0} meals logged
Meals: ${habitLog.nutrition?.meals?.map((m: any) => `${m.meal} (satisfaction: ${m.satisfaction}/10)`).join(', ') || 'None logged'}
Water: ${habitLog.nutrition?.waterGlasses || 0} glasses

Exercise: ${habitLog.exercise?.steps || 0} steps, ${habitLog.exercise?.workoutMinutes || 0} minutes workout
Activity type: ${habitLog.exercise?.type || 'None specified'}

Mood: ${habitLog.mood?.moodRating || 'Not rated'}/10
Stress Level: ${habitLog.mood?.stressLevel || 'Not rated'}/10

Medication: ${habitLog.medication?.notes || 'No medication notes'}

ANALYSIS REQUIREMENTS:
1. Provide ONE specific, actionable insight (max 2 sentences)
2. Focus on the most impactful area for improvement or celebrate the best habit
3. Consider habit interconnections (e.g., poor sleep affecting exercise)
4. Calculate a health score (0-100) based on all factors
5. Determine insight type: positive (score >80), warning (score <50), or suggestion (50-80)

Return JSON format:
{
  "message": "specific insight message",
  "type": "positive|warning|suggestion", 
  "score": number
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            message: { type: "string" },
            type: { type: "string", enum: ["positive", "warning", "suggestion"] },
            score: { type: "number" }
          },
          required: ["message", "type", "score"]
        },
      },
      contents: userPrompt,
    });

    const analysisContent = response.text;
    if (!analysisContent) {
      throw new Error("No analysis content received");
    }

    const analysis = JSON.parse(analysisContent);
    
    return {
      message: analysis.message || "Keep up the great work with your health habits!",
      type: analysis.type || "positive",
      score: Math.max(0, Math.min(100, analysis.score || 75))
    };

  } catch (error) {
    console.error("Habit analysis error:", error);
    
    // Fallback insight based on basic scoring
    const sleepScore = habitLog.sleep?.hours ? Math.min(25, (habitLog.sleep.hours / 8) * 25) : 15;
    const exerciseScore = habitLog.exercise?.steps ? Math.min(25, (habitLog.exercise.steps / 10000) * 25) : 15;
    const nutritionScore = habitLog.nutrition?.meals?.length ? Math.min(25, (habitLog.nutrition.meals.length / 3) * 25) : 15;
    const moodScore = habitLog.mood?.moodRating ? (habitLog.mood.moodRating / 10) * 25 : 15;
    
    const totalScore = Math.round(sleepScore + exerciseScore + nutritionScore + moodScore);
    
    let message = "Great job logging your daily habits! ";
    let type: "positive" | "warning" | "suggestion" = "positive";
    
    if (totalScore >= 80) {
      message += "You're maintaining excellent health habits. Keep it up!";
      type = "positive";
    } else if (totalScore >= 50) {
      message += "Consider focusing on one area to improve your overall health score.";
      type = "suggestion";
    } else {
      message += "Let's work on building more consistent healthy habits together.";
      type = "warning";
    }
    
    return { message, type, score: totalScore };
  }
}