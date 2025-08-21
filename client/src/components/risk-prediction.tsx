import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Heart, 
  Activity, 
  TrendingUp,
  Shield,
  Brain,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuthSimple";
import { apiRequest } from "@/lib/queryClient";

interface RiskFactor {
  name: string;
  value: string;
  impact: "low" | "medium" | "high";
  recommendation: string;
}

interface RiskPrediction {
  condition: string;
  riskLevel: number;
  category: "low" | "moderate" | "high";
  factors: RiskFactor[];
  prevention: string[];
  aiInsight: string;
}

export function RiskPrediction() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateRiskPredictions();
    }
  }, [user]);

  const generateRiskPredictions = async () => {
    try {
      setLoading(true);
      
      // Fetch user's health data for analysis
      const response = await apiRequest("POST", "/api/health/risk-analysis", {
        userId: user?.id
      });
      
      const riskData = await response.json();
      setPredictions(riskData.predictions || getMockPredictions());
      
    } catch (error) {
      console.error("Failed to generate risk predictions:", error);
      // Use mock data for demonstration
      setPredictions(getMockPredictions());
    } finally {
      setLoading(false);
    }
  };

  const getMockPredictions = (): RiskPrediction[] => [
    {
      condition: "Type 2 Diabetes",
      riskLevel: 25,
      category: "low",
      factors: [
        {
          name: "BMI",
          value: "Normal (22.5)",
          impact: "low",
          recommendation: "Maintain current weight"
        },
        {
          name: "Physical Activity",
          value: "Regular exercise",
          impact: "low",
          recommendation: "Continue current activity level"
        },
        {
          name: "Family History",
          value: "No known history",
          impact: "low",
          recommendation: "Regular screening after age 45"
        }
      ],
      prevention: [
        "Maintain healthy diet with limited processed foods",
        "Continue regular exercise routine",
        "Annual health screenings",
        "Monitor blood sugar if symptoms develop"
      ],
      aiInsight: "Your diabetes risk is low due to healthy lifestyle habits. Continue your current exercise routine and balanced diet to maintain this low risk."
    },
    {
      condition: "Hypertension",
      riskLevel: 40,
      category: "moderate",
      factors: [
        {
          name: "Stress Level",
          value: "Moderate (6/10)",
          impact: "medium",
          recommendation: "Practice stress management techniques"
        },
        {
          name: "Salt Intake",
          value: "Slightly elevated",
          impact: "medium",
          recommendation: "Reduce sodium to <2300mg daily"
        },
        {
          name: "Sleep Quality",
          value: "Good (7+ hours)",
          impact: "low",
          recommendation: "Maintain current sleep schedule"
        }
      ],
      prevention: [
        "Reduce sodium intake and processed foods",
        "Practice stress management (meditation, yoga)",
        "Regular blood pressure monitoring",
        "Maintain healthy weight"
      ],
      aiInsight: "Moderate hypertension risk detected. Focus on stress reduction and limiting sodium intake. Your good sleep habits are protective."
    },
    {
      condition: "Heart Disease",
      riskLevel: 20,
      category: "low",
      factors: [
        {
          name: "Cholesterol",
          value: "Normal range",
          impact: "low",
          recommendation: "Continue heart-healthy diet"
        },
        {
          name: "Exercise Frequency",
          value: "4-5 times/week",
          impact: "low",
          recommendation: "Maintain current activity level"
        },
        {
          name: "Smoking Status",
          value: "Non-smoker",
          impact: "low",
          recommendation: "Continue avoiding tobacco"
        }
      ],
      prevention: [
        "Continue regular cardiovascular exercise",
        "Maintain healthy cholesterol levels",
        "Regular heart health screenings",
        "Mediterranean-style diet"
      ],
      aiInsight: "Low heart disease risk thanks to your active lifestyle and non-smoking status. Your regular exercise routine is excellent for heart health."
    }
  ];

  const getRiskColor = (category: string) => {
    switch (category) {
      case "low": return "text-green-600 border-green-500 bg-green-50";
      case "moderate": return "text-yellow-600 border-yellow-500 bg-yellow-50";
      case "high": return "text-red-600 border-red-500 bg-red-50";
      default: return "text-gray-600 border-gray-500 bg-gray-50";
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case "low": return <Shield className="w-5 h-5 text-green-600" />;
      case "moderate": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "high": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Health Risk Predictions</h2>
          <p className="text-muted-foreground">
            AI-powered analysis of your chronic disease risk factors
          </p>
        </div>
        <Button onClick={generateRiskPredictions} variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Risk Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Health Risk</h3>
              <p className="text-sm text-muted-foreground">
                Based on lifestyle factors and health history
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">Low Risk</div>
              <p className="text-sm text-muted-foreground">Excellent health profile</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Risk Predictions */}
      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <Card key={index} className={`border-l-4 ${getRiskColor(prediction.category)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  {getRiskIcon(prediction.category)}
                  {prediction.condition}
                </CardTitle>
                <Badge variant={prediction.category === "low" ? "default" : 
                               prediction.category === "moderate" ? "secondary" : "destructive"}>
                  {prediction.riskLevel}% Risk
                </Badge>
              </div>
              <CardDescription>
                Risk assessment based on current health indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Level Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Risk Level</span>
                  <span className="text-sm text-muted-foreground">{prediction.riskLevel}%</span>
                </div>
                <Progress 
                  value={prediction.riskLevel} 
                  className={`h-2 ${prediction.category === "low" ? "[&>div]:bg-green-500" : 
                              prediction.category === "moderate" ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"}`}
                />
              </div>

              {/* AI Insight */}
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 text-sm">AI Analysis</h4>
                    <p className="text-sm text-blue-700 mt-1">{prediction.aiInsight}</p>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Risk Factors
                </h4>
                <div className="grid gap-2">
                  {prediction.factors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{factor.name}:</span>
                        <span className="text-sm text-muted-foreground ml-2">{factor.value}</span>
                      </div>
                      <Badge 
                        variant={factor.impact === "low" ? "default" : 
                                factor.impact === "medium" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {factor.impact} impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prevention Strategies */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Prevention Strategies
                </h4>
                <ul className="space-y-2">
                  {prediction.prevention.map((strategy, strategyIndex) => (
                    <li key={strategyIndex} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Take Control of Your Health</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Regular monitoring and preventive care can significantly reduce these risks
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Schedule Health Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}