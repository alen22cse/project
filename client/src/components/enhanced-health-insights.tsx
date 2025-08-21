import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Shield,
  Target,
  Zap,
  Users,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthSimple";
import { RiskPrediction } from "./risk-prediction";
import { MedicationReminder } from "./medication-reminder";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface HealthInsight {
  title: string;
  description: string;
  category: "nutrition" | "exercise" | "sleep" | "mental" | "medical";
  priority: "low" | "medium" | "high";
  actionable: boolean;
  recommendation: string;
}

interface PersonalCoaching {
  message: string;
  type: "encouragement" | "reminder" | "warning" | "tip";
  action?: string;
}

export function EnhancedHealthInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [coaching, setCoaching] = useState<PersonalCoaching | null>(null);
  const [activeTab, setActiveTab] = useState("insights");

  useEffect(() => {
    if (user) {
      generatePersonalizedInsights();
      generatePersonalCoaching();
    }
  }, [user]);

  const generatePersonalizedInsights = () => {
    // In real implementation, this would analyze user's health data
    const personalizedInsights: HealthInsight[] = [
      {
        title: "Sleep Pattern Optimization",
        description: "Your sleep quality has improved 15% this week",
        category: "sleep",
        priority: "medium",
        actionable: true,
        recommendation: "Try going to bed 30 minutes earlier to reach your 8-hour sleep goal consistently"
      },
      {
        title: "Nutrition Balance Alert",
        description: "Low vegetable intake detected in recent meal logs",
        category: "nutrition", 
        priority: "high",
        actionable: true,
        recommendation: "Add 2 servings of leafy greens to your daily meals for better nutrient balance"
      },
      {
        title: "Exercise Streak Recognition",
        description: "Congratulations on maintaining your workout routine for 12 days!",
        category: "exercise",
        priority: "low",
        actionable: false,
        recommendation: "Keep up the excellent work - you're building a strong healthy habit"
      },
      {
        title: "Stress Management Suggestion",
        description: "Elevated stress levels correlate with reduced sleep quality",
        category: "mental",
        priority: "medium",
        actionable: true,
        recommendation: "Try 10 minutes of meditation before bedtime to improve both stress and sleep"
      },
      {
        title: "Hydration Improvement",
        description: "Water intake increased by 25% compared to last week",
        category: "nutrition",
        priority: "low",
        actionable: false,
        recommendation: "Excellent hydration habits - this supports your overall health goals"
      }
    ];
    
    setInsights(personalizedInsights);
  };

  const generatePersonalCoaching = () => {
    const coachingMessages = [
      {
        message: "Your consistency with daily tracking is impressive! You've logged 8 out of the last 10 days.",
        type: "encouragement" as const,
      },
      {
        message: "Consider adding a 15-minute walk after lunch to boost your afternoon energy.",
        type: "tip" as const,
        action: "Set a daily 3 PM reminder"
      },
      {
        message: "Your sleep scores are trending upward - keep prioritizing your bedtime routine!",
        type: "encouragement" as const,
      }
    ];
    
    setCoaching(coachingMessages[Math.floor(Math.random() * coachingMessages.length)]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "nutrition": return <Heart className="w-4 h-4" />;
      case "exercise": return <TrendingUp className="w-4 h-4" />;
      case "sleep": return <Calendar className="w-4 h-4" />;
      case "mental": return <Brain className="w-4 h-4" />;
      case "medical": return <Shield className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-500 bg-red-50";
      case "medium": return "border-yellow-500 bg-yellow-50";
      case "low": return "border-green-500 bg-green-50";
      default: return "border-gray-500 bg-gray-50";
    }
  };

  const getCoachingColor = (type: string) => {
    switch (type) {
      case "encouragement": return "border-green-500 bg-green-50 text-green-800";
      case "tip": return "border-blue-500 bg-blue-50 text-blue-800";
      case "reminder": return "border-yellow-500 bg-yellow-50 text-yellow-800";
      case "warning": return "border-red-500 bg-red-50 text-red-800";
      default: return "border-gray-500 bg-gray-50 text-gray-800";
    }
  };

  // Mock trend data
  const trendData = [
    { day: "Mon", healthScore: 78, mood: 7, energy: 6 },
    { day: "Tue", healthScore: 82, mood: 8, energy: 7 },
    { day: "Wed", healthScore: 75, mood: 6, energy: 6 },
    { day: "Thu", healthScore: 85, mood: 8, energy: 8 },
    { day: "Fri", healthScore: 88, mood: 9, energy: 8 },
    { day: "Sat", healthScore: 90, mood: 9, energy: 9 },
    { day: "Sun", healthScore: 86, mood: 8, energy: 7 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Personalized Health Insights</h2>
        <p className="text-muted-foreground">
          AI-powered analysis based on your individual health patterns
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="coaching">Personal Coach</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Personal AI Coach Message */}
          {coaching && (
            <Card className={`border-l-4 ${getCoachingColor(coaching.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Your Personal AI Health Coach</h4>
                    <p className="text-sm">{coaching.message}</p>
                    {coaching.action && (
                      <Button size="sm" variant="outline" className="mt-2">
                        {coaching.action}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Health Trends</CardTitle>
              <CardDescription>Your health metrics over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="healthScore" stroke="#8884d8" strokeWidth={2} name="Health Score" />
                  <Line type="monotone" dataKey="mood" stroke="#82ca9d" strokeWidth={2} name="Mood" />
                  <Line type="monotone" dataKey="energy" stroke="#ffc658" strokeWidth={2} name="Energy" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Personalized Insights */}
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${getPriorityColor(insight.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getCategoryIcon(insight.category)}
                      <div>
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <p className="text-sm font-medium">{insight.recommendation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.priority === "high" ? "destructive" : 
                                   insight.priority === "medium" ? "secondary" : "default"}>
                        {insight.priority} priority
                      </Badge>
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coaching" className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personalized Health Coaching
              </CardTitle>
              <CardDescription>
                AI-tailored lifestyle tips based on your habits and symptoms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-2">Today's Focus: Sleep Optimization</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your recent sleep patterns, here's your personalized plan:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-blue-500" />
                    Set a consistent bedtime of 10:30 PM
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-blue-500" />
                    Avoid screens 1 hour before bed
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-blue-500" />
                    Try chamomile tea as part of your wind-down routine
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-2">Nutrition Coaching</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Your meal timing and choices are improving. Here's what to focus on:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-green-500" />
                    Add more protein to breakfast (aim for 20-25g)
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-green-500" />
                    Include colorful vegetables in each meal
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-green-500" />
                    Stay hydrated - you're doing great with water intake!
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <RiskPrediction />
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <MedicationReminder />
        </TabsContent>
      </Tabs>
    </div>
  );
}