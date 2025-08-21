import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Apple, 
  Droplets, 
  Moon, 
  Dumbbell, 
  Pill, 
  Heart,
  Plus,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HabitLog {
  id: string;
  date: Date;
  nutrition: {
    meals: number;
    waterGlasses: number;
    notes: string;
  };
  sleep: {
    hours: number;
    quality: number; // 1-10
    notes: string;
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
    stressLevel: number; // 1-10
    moodRating: number; // 1-10
    notes: string;
  };
}

export function HabitTracker() {
  const { toast } = useToast();
  const [isLogging, setIsLogging] = useState(false);
  const [currentLog, setCurrentLog] = useState<Partial<HabitLog>>({
    date: new Date(),
    nutrition: { meals: 3, waterGlasses: 8, notes: "" },
    sleep: { hours: 8, quality: 7, notes: "" },
    exercise: { steps: 10000, workoutMinutes: 30, type: "" },
    medication: { taken: [], missed: [], notes: "" },
    mood: { stressLevel: 5, moodRating: 7, notes: "" },
  });

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

  const saveHabitLog = async () => {
    setIsLogging(true);
    try {
      // Here you would normally save to your backend
      console.log("Saving habit log:", currentLog);
      
      toast({
        title: "Habits Logged",
        description: "Your daily habits have been successfully recorded.",
      });

      // Reset form for next day
      setCurrentLog({
        date: new Date(),
        nutrition: { meals: 3, waterGlasses: 8, notes: "" },
        sleep: { hours: 8, quality: 7, notes: "" },
        exercise: { steps: 10000, workoutMinutes: 30, type: "" },
        medication: { taken: [], missed: [], notes: "" },
        mood: { stressLevel: 5, moodRating: 7, notes: "" },
      });

    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save your habit log. Please try again.",
        variant: "destructive",
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
        <Button onClick={saveHabitLog} disabled={isLogging} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isLogging ? "Saving..." : "Save Today's Log"}
        </Button>
      </div>

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
            <div>
              <Label htmlFor="meals">Meals consumed today</Label>
              <Input
                id="meals"
                type="number"
                value={currentLog.nutrition?.meals || 0}
                onChange={(e) => updateNutrition("meals", parseInt(e.target.value))}
                min="0"
                max="10"
              />
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