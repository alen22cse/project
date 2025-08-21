import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame,
  Award,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  Heart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthSimple";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "health" | "consistency" | "milestone";
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  target: number;
  rewards: string[];
}

interface HealthStreak {
  type: "daily_logging" | "exercise" | "sleep" | "nutrition" | "meditation";
  name: string;
  current: number;
  best: number;
  icon: string;
  active: boolean;
}

interface HealthLevel {
  level: number;
  title: string;
  experience: number;
  experienceToNext: number;
  totalExperience: number;
  perks: string[];
}

export function GamificationSystem() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streaks, setStreaks] = useState<HealthStreak[]>([]);
  const [healthLevel, setHealthLevel] = useState<HealthLevel>({
    level: 3,
    title: "Health Enthusiast",
    experience: 450,
    experienceToNext: 550,
    totalExperience: 450,
    perks: ["Daily AI insights", "Custom health reports", "Priority support"]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      // Simulate loading user's gamification data
      const mockAchievements: Achievement[] = [
        {
          id: "first_log",
          name: "First Steps",
          description: "Log your first day of health habits",
          icon: "🎯",
          category: "milestone",
          unlocked: true,
          unlockedDate: "2024-01-15",
          progress: 1,
          target: 1,
          rewards: ["50 XP", "Health Tracker Badge"]
        },
        {
          id: "week_streak",
          name: "Consistency Champion",
          description: "Maintain a 7-day logging streak",
          icon: "🔥",
          category: "streak",
          unlocked: true,
          unlockedDate: "2024-01-22",
          progress: 7,
          target: 7,
          rewards: ["100 XP", "Streak Master Badge"]
        },
        {
          id: "sleep_master",
          name: "Sleep Master",
          description: "Get 8+ hours of sleep for 5 consecutive days",
          icon: "😴",
          category: "health",
          unlocked: false,
          progress: 3,
          target: 5,
          rewards: ["75 XP", "Sleep Quality Badge", "Personalized sleep tips"]
        },
        {
          id: "exercise_warrior",
          name: "Exercise Warrior",
          description: "Reach 10,000 steps for 10 days",
          icon: "💪",
          category: "health",
          unlocked: false,
          progress: 6,
          target: 10,
          rewards: ["125 XP", "Fitness Badge", "Advanced workout plans"]
        },
        {
          id: "nutrition_guru",
          name: "Nutrition Guru",
          description: "Log all meals for 14 days",
          icon: "🥗",
          category: "consistency",
          unlocked: false,
          progress: 8,
          target: 14,
          rewards: ["100 XP", "Nutrition Badge", "Meal planning guide"]
        },
        {
          id: "health_score_80",
          name: "Health Excellence",
          description: "Achieve a health score of 80+ for 3 days",
          icon: "⭐",
          category: "health",
          unlocked: false,
          progress: 1,
          target: 3,
          rewards: ["150 XP", "Excellence Badge", "Premium health insights"]
        }
      ];

      const mockStreaks: HealthStreak[] = [
        {
          type: "daily_logging",
          name: "Daily Logging",
          current: 12,
          best: 18,
          icon: "📝",
          active: true
        },
        {
          type: "exercise",
          name: "Exercise",
          current: 6,
          best: 15,
          icon: "🏃",
          active: true
        },
        {
          type: "sleep",
          name: "Quality Sleep",
          current: 4,
          best: 9,
          icon: "😴",
          active: true
        },
        {
          type: "nutrition",
          name: "Nutrition Tracking",
          current: 0,
          best: 12,
          icon: "🍎",
          active: false
        },
        {
          type: "meditation",
          name: "Mindfulness",
          current: 2,
          best: 7,
          icon: "🧘",
          active: true
        }
      ];

      setAchievements(mockAchievements);
      setStreaks(mockStreaks);
    } catch (error) {
      console.error("Failed to load gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min(100, (progress / target) * 100);
  };

  const getLevelProgress = () => {
    return (healthLevel.experience / healthLevel.experienceToNext) * 100;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "streak": return <Flame className="w-4 h-4" />;
      case "health": return <Heart className="w-4 h-4" />;
      case "consistency": return <Calendar className="w-4 h-4" />;
      case "milestone": return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading gamification data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Health Achievement Center</h2>
        <p className="text-muted-foreground">
          Track your progress, earn rewards, and level up your health journey
        </p>
      </div>

      {/* Health Level Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Level {healthLevel.level}</h3>
                <p className="text-sm text-muted-foreground">{healthLevel.title}</p>
              </div>
            </div>
            <Badge className="bg-purple-600 text-white">
              {healthLevel.experience} / {healthLevel.experienceToNext} XP
            </Badge>
          </div>
          
          <Progress value={getLevelProgress()} className="h-3 mb-3" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-medium">Total XP</p>
              <p className="text-lg font-bold text-purple-600">{healthLevel.totalExperience}</p>
            </div>
            <div>
              <p className="text-sm font-medium">To Next Level</p>
              <p className="text-lg font-bold text-purple-600">{healthLevel.experienceToNext - healthLevel.experience}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Streaks</p>
              <p className="text-lg font-bold text-purple-600">{streaks.filter(s => s.active).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Active Streaks
          </CardTitle>
          <CardDescription>Keep your momentum going!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streaks.map((streak, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${streak.active ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{streak.icon}</span>
                  <Badge variant={streak.active ? "default" : "secondary"}>
                    {streak.active ? "Active" : "Broken"}
                  </Badge>
                </div>
                <h4 className="font-medium mb-1">{streak.name}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current: {streak.current}</span>
                  <span className="text-muted-foreground">Best: {streak.best}</span>
                </div>
                {streak.active && (
                  <div className="mt-2 flex items-center gap-1 text-orange-600">
                    <Flame className="w-3 h-3" />
                    <span className="text-xs font-medium">Keep it up!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock rewards by completing health goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-lg border-2 ${achievement.unlocked ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${achievement.unlocked ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {achievement.unlocked ? <Award className="w-5 h-5" /> : getCategoryIcon(achievement.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <span className="text-lg">{achievement.icon}</span>
                        {achievement.unlocked && (
                          <Badge className="bg-yellow-500 text-white text-xs">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      
                      {!achievement.unlocked && (
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.target}
                            </span>
                          </div>
                          <Progress value={getProgressPercentage(achievement.progress, achievement.target)} className="h-1" />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {achievement.rewards.map((reward, rewardIndex) => (
                          <Badge key={rewardIndex} variant="outline" className="text-xs">
                            {reward}
                          </Badge>
                        ))}
                      </div>
                      
                      {achievement.unlocked && achievement.unlockedDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Perks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Level {healthLevel.level} Perks
          </CardTitle>
          <CardDescription>Benefits you've unlocked at your current level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {healthLevel.perks.map((perk, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <Star className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}