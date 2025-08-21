import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  Calendar,
  Award,
  Heart,
  Moon,
  Dumbbell,
  Apple,
  BarChart3,
  Users,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthSimple";
import { apiRequest } from "@/lib/queryClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface HealthStats {
  healthScore: number;
  daysTracked: number;
  streak: number;
  weeklyTrends: {
    sleep: number[];
    exercise: number[];
    mood: number[];
    nutrition: number[];
  };
  aiInsights: string[];
  consultationSuggested: boolean;
}

interface DashboardOverviewProps {
  onViewAnalytics: () => void;
}

export function DynamicDashboardOverview({ onViewAnalytics }: DashboardOverviewProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<HealthStats>({
    healthScore: 75,
    daysTracked: 0,
    streak: 0,
    weeklyTrends: {
      sleep: [],
      exercise: [],
      mood: [],
      nutrition: []
    },
    aiInsights: [],
    consultationSuggested: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthStats();
    }
  }, [user]);

  const fetchHealthStats = async () => {
    try {
      setLoading(true);
      
      // Fetch recent habit logs
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      const response = await apiRequest("GET", `/api/habits/${user?.id}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      const habitLogs = await response.json();
      
      // Calculate statistics from real data
      const calculatedStats = calculateHealthStatistics(habitLogs);
      setStats(calculatedStats);
      
    } catch (error) {
      console.error("Failed to fetch health stats:", error);
      // Use default values if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthStatistics = (habitLogs: any[]): HealthStats => {
    if (!habitLogs || habitLogs.length === 0) {
      return {
        healthScore: 75,
        daysTracked: 0,
        streak: 0,
        weeklyTrends: { sleep: [], exercise: [], mood: [], nutrition: [] },
        aiInsights: ["Start tracking your daily habits to get personalized AI insights!"],
        consultationSuggested: false
      };
    }

    // Calculate days tracked
    const daysTracked = habitLogs.length;
    
    // Calculate current streak (consecutive days)
    let streak = 0;
    const sortedLogs = habitLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date();
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (logDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate health score (average of all logged days)
    const healthScores = habitLogs.map(log => {
      let score = 0;
      let factors = 0;
      
      if (log.sleep?.hours) {
        score += Math.min(25, (log.sleep.hours / 8) * 25);
        factors++;
      }
      if (log.exercise?.steps) {
        score += Math.min(25, (log.exercise.steps / 10000) * 25);
        factors++;
      }
      if (log.nutrition?.meals?.length) {
        score += Math.min(25, (log.nutrition.meals.length / 3) * 25);
        factors++;
      }
      if (log.mood?.moodRating) {
        score += (log.mood.moodRating / 10) * 25;
        factors++;
      }
      
      return factors > 0 ? (score / factors) * 4 : 75;
    });
    
    const avgHealthScore = healthScores.length > 0 
      ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
      : 75;

    // Calculate weekly trends (last 7 days)
    const last7Days = habitLogs.slice(-7);
    const weeklyTrends = {
      sleep: last7Days.map(log => log.sleep?.hours || 0),
      exercise: last7Days.map(log => (log.exercise?.steps || 0) / 1000), // Convert to thousands
      mood: last7Days.map(log => log.mood?.moodRating || 0),
      nutrition: last7Days.map(log => log.nutrition?.meals?.length || 0)
    };

    // Generate AI insights based on patterns
    const insights = generateInsights(habitLogs, avgHealthScore);
    
    // Suggest consultation if health score is consistently low
    const consultationSuggested = avgHealthScore < 60 || 
      habitLogs.slice(-3).every(log => {
        const score = calculateLogScore(log);
        return score < 60;
      });

    return {
      healthScore: avgHealthScore,
      daysTracked,
      streak,
      weeklyTrends,
      aiInsights: insights,
      consultationSuggested
    };
  };

  const calculateLogScore = (log: any): number => {
    let score = 0;
    let factors = 0;
    
    if (log.sleep?.hours) {
      score += Math.min(25, (log.sleep.hours / 8) * 25);
      factors++;
    }
    if (log.exercise?.steps) {
      score += Math.min(25, (log.exercise.steps / 10000) * 25);
      factors++;
    }
    if (log.nutrition?.meals?.length) {
      score += Math.min(25, (log.nutrition.meals.length / 3) * 25);
      factors++;
    }
    if (log.mood?.moodRating) {
      score += (log.mood.moodRating / 10) * 25;
      factors++;
    }
    
    return factors > 0 ? (score / factors) * 4 : 75;
  };

  const generateInsights = (logs: any[], healthScore: number): string[] => {
    const insights: string[] = [];
    
    if (logs.length === 0) {
      return ["Start tracking your habits to get personalized insights!"];
    }
    
    // Sleep analysis
    const avgSleep = logs.reduce((sum, log) => sum + (log.sleep?.hours || 0), 0) / logs.length;
    if (avgSleep < 7) {
      insights.push("Consider improving your sleep routine - aim for 7-9 hours nightly for better health.");
    } else if (avgSleep >= 8) {
      insights.push("Excellent sleep habits! Quality sleep supports your overall wellness.");
    }
    
    // Exercise analysis
    const avgSteps = logs.reduce((sum, log) => sum + (log.exercise?.steps || 0), 0) / logs.length;
    if (avgSteps >= 10000) {
      insights.push("Great job staying active! Your step count shows consistent physical activity.");
    } else if (avgSteps < 5000) {
      insights.push("Try to increase your daily movement - even a 10-minute walk can boost your health score.");
    }
    
    // Mood analysis
    const avgMood = logs.reduce((sum, log) => sum + (log.mood?.moodRating || 0), 0) / logs.length;
    if (avgMood < 6) {
      insights.push("Your mood scores suggest focusing on stress management and mental wellness.");
    }
    
    // Overall health score insight
    if (healthScore >= 85) {
      insights.push("Outstanding health management! You're maintaining excellent daily habits.");
    } else if (healthScore >= 70) {
      insights.push("Good progress on your health journey. Small improvements can boost your score further.");
    } else {
      insights.push("Focus on building one healthy habit at a time - consistency is key to improvement.");
    }
    
    return insights.slice(0, 3); // Limit to 3 insights
  };

  const chartData = stats.weeklyTrends.sleep.map((sleep, index) => ({
    day: `Day ${index + 1}`,
    sleep,
    exercise: stats.weeklyTrends.exercise[index] || 0,
    mood: stats.weeklyTrends.mood[index] || 0,
    nutrition: stats.weeklyTrends.nutrition[index] || 0,
  }));

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Health Score</p>
                <p className="text-2xl font-bold text-blue-700">{stats.healthScore}/100</p>
              </div>
              <Heart className={`w-8 h-8 ${stats.healthScore >= 80 ? 'text-green-500' : stats.healthScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`} />
            </div>
            <Progress value={stats.healthScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Days Tracked</p>
                <p className="text-2xl font-bold text-green-700">{stats.daysTracked}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Current Streak</p>
                <p className="text-2xl font-bold text-purple-700">{stats.streak} days</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">AI Insights</p>
                <p className="text-2xl font-bold text-orange-700">{stats.aiInsights.length}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Health Trends</span>
            <Button variant="outline" size="sm" onClick={onViewAnalytics}>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </Button>
          </CardTitle>
          <CardDescription>Your health metrics over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sleep" stroke="#8884d8" strokeWidth={2} name="Sleep (hrs)" />
              <Line type="monotone" dataKey="mood" stroke="#82ca9d" strokeWidth={2} name="Mood" />
              <Line type="monotone" dataKey="exercise" stroke="#ffc658" strokeWidth={2} name="Exercise (k steps)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Personalized AI Insights
          </CardTitle>
          <CardDescription>Based on your health tracking patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.aiInsights.map((insight, index) => (
            <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consultation Suggestion */}
      {stats.consultationSuggested && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Consider a Health Consultation</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Based on your recent health patterns, it might be beneficial to consult with a healthcare provider for personalized guidance.
                </p>
                <Button variant="outline" size="sm" className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  <Users className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}