import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Apple, 
  Droplets, 
  Moon, 
  Dumbbell, 
  Pill, 
  Heart,
  Plus,
  Save,
  TrendingUp,
  Award,
  Zap,
  Mic
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuthSimple";
import { apiRequest } from "@/lib/queryClient";

interface HabitLog {
  id: string;
  date: string;
  nutrition: {
    meals: { meal: string; time: string; satisfaction: number }[];
    waterGlasses: number;
    notes: string;
  };
  sleep: {
    hours: number;
    quality: number;
    notes: string;
    snoring?: boolean;
    stressRelated?: boolean;
  };
  exercise: {
    steps: number;
    workoutMinutes: number;
    type: string;
  };
  medication: {
    taken: string[];
    missed: string[];
    notes: string;
  };
  mood: {
    stressLevel: number;
    moodRating: number;
    notes: string;
  };
}

interface AIInsight {
  message: string;
  type: "positive" | "warning" | "suggestion";
  score: number;
}

export function HabitTracker() {
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [healthScore, setHealthScore] = useState(75);
  const [streak, setStreak] = useState(0);
  const [showAdaptiveQuestions, setShowAdaptiveQuestions] = useState(false);
  const [currentMeal, setCurrentMeal] = useState({ meal: "", time: "", satisfaction: 8 });
  
  const [currentLog, setCurrentLog] = useState<Partial<HabitLog>>({
    date: new Date().toISOString().split('T')[0],
    nutrition: { meals: [], waterGlasses: 8, notes: "" },
    sleep: { hours: 8, quality: 7, notes: "", snoring: false, stressRelated: false },
    exercise: { steps: 10000, workoutMinutes: 30, type: "" },
    medication: { taken: [], missed: [], notes: "" },
    mood: { stressLevel: 5, moodRating: 7, notes: "" },
  });

  useEffect(() => {
    if (currentLog.sleep?.quality && currentLog.sleep.quality < 6) {
      setShowAdaptiveQuestions(true);
    } else {
      setShowAdaptiveQuestions(false);
    }
  }, [currentLog.sleep?.quality]);

  const updateNutrition = (field: string, value: any) => {
    setCurrentLog(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition!, [field]: value }
    }));
  };

  const updateSleep = (field: string, value: any) => {
    setCurrentLog(prev => ({
      ...prev,
      sleep: { ...prev.sleep!, [field]: value }
    }));
  };

  const updateExercise = (field: string, value: any) => {
    setCurrentLog(prev => ({
      ...prev,
      exercise: { ...prev.exercise!, [field]: value }
    }));
  };

  const updateMedication = (field: string, value: any) => {
    setCurrentLog(prev => ({
      ...prev,
      medication: { ...prev.medication!, [field]: value }
    }));
  };

  const updateMood = (field: string, value: any) => {
    setCurrentLog(prev => ({
      ...prev,
      mood: { ...prev.mood!, [field]: value }
    }));
  };

  const addMeal = () => {
    if (currentMeal.meal.trim()) {
      setCurrentLog(prev => ({
        ...prev,
        nutrition: {
          ...prev.nutrition!,
          meals: [...(prev.nutrition?.meals || []), currentMeal]
        }
      }));
      setCurrentMeal({ meal: "", time: "", satisfaction: 8 });
    }
  };

  const removeMeal = (index: number) => {
    setCurrentLog(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition!,
        meals: prev.nutrition?.meals?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const generateAIInsight = async (logData: Partial<HabitLog>) => {
    try {
      const response = await apiRequest("POST", "/api/habits/analyze", {
        habitLog: logData,
        userId: user?.id
      });
      
      const result = await response.json();
      setAiInsight(result.insight);
      
      toast({
        title: "AI Analysis Complete",
        description: "Personal recommendations generated based on your habits.",
      });
    } catch (error) {
      console.error("Error generating AI insight:", error);
      toast({
        title: "AI Analysis Error", 
        description: "Unable to generate recommendations. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveHabitLog = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your habits.",
        variant: "destructive"
      });
      return;
    }

    setIsLogging(true);
    try {
      const logWithId = {
        ...currentLog,
        id: `${user.id}-${currentLog.date}`,
        userId: user.id
      };

      await apiRequest("POST", "/api/habits", logWithId);
      
      // Generate AI insight after successful save
      await generateAIInsight(logWithId);
      
      // Update health score and streak
      setHealthScore(prev => Math.min(100, prev + 2));
      setStreak(prev => prev + 1);
      
      toast({
        title: "Habits Saved Successfully",
        description: "Your daily log has been recorded with AI recommendations.",
      });

      // Reset form
      setCurrentLog({
        date: new Date().toISOString().split('T')[0],
        nutrition: { meals: [], waterGlasses: 8, notes: "" },
        sleep: { hours: 8, quality: 7, notes: "", snoring: false, stressRelated: false },
        exercise: { steps: 10000, workoutMinutes: 30, type: "" },
        medication: { taken: [], missed: [], notes: "" },
        mood: { stressLevel: 5, moodRating: 7, notes: "" },
      });

    } catch (error) {
      console.error("Failed to save habit log:", error);
      toast({
        title: "Save Failed",
        description: "Unable to save your habits. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Habit Tracker</h2>
          <p className="text-muted-foreground">
            Track your daily habits for better health insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Health Score: {healthScore}/100</span>
            </div>
          </div>
          <Button onClick={saveHabitLog} disabled={isLogging} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isLogging ? "Saving..." : "Save Today's Log"}
          </Button>
        </div>
      </div>

      {/* Health Score Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Health Score</span>
            <Badge variant={healthScore >= 80 ? "default" : healthScore >= 60 ? "secondary" : "destructive"}>
              {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
          <Progress value={healthScore} className="h-2" />
        </CardContent>
      </Card>

      {/* AI Insight */}
      {aiInsight && (
        <Card className={`border-l-4 ${aiInsight.type === 'positive' ? 'border-green-500 bg-green-50' : 
          aiInsight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className={`w-5 h-5 mt-0.5 ${aiInsight.type === 'positive' ? 'text-green-600' : 
                aiInsight.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
              <div>
                <h4 className="font-medium mb-1">AI Health Insight</h4>
                <p className="text-sm text-muted-foreground">{aiInsight.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nutrition Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-600" />
              Nutrition
            </CardTitle>
            <CardDescription>Track your meals and water intake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meal Tracker */}
            <div>
              <Label>Track Individual Meals</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Meal description (e.g., Chicken salad)"
                  value={currentMeal.meal}
                  onChange={(e) => setCurrentMeal(prev => ({ ...prev, meal: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={currentMeal.time}
                  onChange={(e) => setCurrentMeal(prev => ({ ...prev, time: e.target.value }))}
                  className="w-32"
                />
                <Button onClick={addMeal} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Satisfaction (1-10)</Label>
                <Slider
                  value={[currentMeal.satisfaction]}
                  onValueChange={(value) => setCurrentMeal(prev => ({ ...prev, satisfaction: value[0] }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Logged Meals */}
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground">Today's Meals ({currentLog.nutrition?.meals?.length || 0})</Label>
                <div className="space-y-2 mt-2">
                  {currentLog.nutrition?.meals?.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{meal.meal}</span>
                        {meal.time && <span className="text-sm text-muted-foreground ml-2">at {meal.time}</span>}
                        <div className="text-xs text-muted-foreground">Satisfaction: {meal.satisfaction}/10</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeMeal(index)}>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="water">Water glasses (8oz each)</Label>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <Input
                  id="water"
                  type="number"
                  value={currentLog.nutrition?.waterGlasses || 0}
                  onChange={(e) => updateNutrition("waterGlasses", parseInt(e.target.value))}
                  min="0"
                  max="20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="nutrition-notes">Nutrition notes</Label>
              <Textarea
                id="nutrition-notes"
                placeholder="Any specific foods, snacks, or dietary notes..."
                value={currentLog.nutrition?.notes || ""}
                onChange={(e) => updateNutrition("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sleep Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-600" />
              Sleep
            </CardTitle>
            <CardDescription>Track your sleep duration and quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sleep-hours">Hours of sleep</Label>
              <Input
                id="sleep-hours"
                type="number"
                step="0.5"
                value={currentLog.sleep?.hours || 0}
                onChange={(e) => updateSleep("hours", parseFloat(e.target.value))}
                min="0"
                max="24"
              />
            </div>
            <div>
              <Label>Sleep quality (1-10)</Label>
              <div className="px-2">
                <Slider
                  value={[currentLog.sleep?.quality || 7]}
                  onValueChange={(value) => updateSleep("quality", value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="sleep-notes">Sleep notes</Label>
              <Textarea
                id="sleep-notes"
                placeholder="Sleep environment, disturbances, etc..."
                value={currentLog.sleep?.notes || ""}
                onChange={(e) => updateSleep("notes", e.target.value)}
              />
            </div>

            {/* Adaptive Questions for Poor Sleep */}
            {showAdaptiveQuestions && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium mb-3 text-yellow-800">Sleep Quality Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="snoring"
                      checked={currentLog.sleep?.snoring || false}
                      onChange={(e) => updateSleep("snoring", e.target.checked)}
                    />
                    <Label htmlFor="snoring" className="text-sm">Did you experience snoring?</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stress-sleep"
                      checked={currentLog.sleep?.stressRelated || false}
                      onChange={(e) => updateSleep("stressRelated", e.target.checked)}
                    />
                    <Label htmlFor="stress-sleep" className="text-sm">Was poor sleep related to stress/anxiety?</Label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-orange-600" />
              Exercise
            </CardTitle>
            <CardDescription>Track your physical activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="steps">Steps taken</Label>
              <Input
                id="steps"
                type="number"
                value={currentLog.exercise?.steps || 0}
                onChange={(e) => updateExercise("steps", parseInt(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="workout">Workout minutes</Label>
              <Input
                id="workout"
                type="number"
                value={currentLog.exercise?.workoutMinutes || 0}
                onChange={(e) => updateExercise("workoutMinutes", parseInt(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="exercise-type">Exercise type</Label>
              <Input
                id="exercise-type"
                placeholder="Running, gym, yoga, swimming..."
                value={currentLog.exercise?.type || ""}
                onChange={(e) => updateExercise("type", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mood & Stress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Mood & Stress
            </CardTitle>
            <CardDescription>Track your mental wellbeing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Stress level (1-10)</Label>
              <div className="px-2">
                <Slider
                  value={[currentLog.mood?.stressLevel || 5]}
                  onValueChange={(value) => updateMood("stressLevel", value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Relaxed</span>
                  <span>Very Stressed</span>
                </div>
              </div>
            </div>
            <div>
              <Label>Overall mood (1-10)</Label>
              <div className="px-2">
                <Slider
                  value={[currentLog.mood?.moodRating || 7]}
                  onValueChange={(value) => updateMood("moodRating", value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Very Low</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="mood-notes">Mood notes</Label>
              <Textarea
                id="mood-notes"
                placeholder="What affected your mood today?"
                value={currentLog.mood?.notes || ""}
                onChange={(e) => updateMood("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medication Section - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            Medication Adherence
          </CardTitle>
          <CardDescription>Track your medication schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="medication-notes">Medication notes</Label>
            <Textarea
              id="medication-notes"
              placeholder="List medications taken, missed doses, side effects..."
              value={currentLog.medication?.notes || ""}
              onChange={(e) => updateMedication("notes", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}