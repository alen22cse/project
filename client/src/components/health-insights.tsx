import { useState, useEffect } from "react";
import { Brain, TrendingUp, Calendar, MapPin, Users, Lightbulb, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HealthTrend {
  id: string;
  pattern: string;
  confidence: number;
  description: string;
  recommendation: string;
  trend: "improving" | "stable" | "worsening";
}

interface RegionalData {
  region: string;
  commonSymptoms: string[];
  riskFactors: string[];
  prevalence: number;
}

interface PersonalizedInsight {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  recommendation?: string;
}

export function HealthInsights() {
  const [trends, setTrends] = useState<HealthTrend[]>([
    {
      id: "1",
      pattern: "Stress-Related Headaches",
      confidence: 85,
      description: "Your headache patterns correlate strongly with reported stress levels and screen time.",
      recommendation: "Consider stress management techniques and regular screen breaks.",
      trend: "worsening"
    },
    {
      id: "2", 
      pattern: "Sleep Quality Impact",
      confidence: 78,
      description: "Symptom severity appears to decrease when you report better sleep quality.",
      recommendation: "Maintaining consistent sleep schedule may help reduce symptom frequency.",
      trend: "improving"
    }
  ]);

  const [regionalData, setRegionalData] = useState<RegionalData>({
    region: "Northeast US",
    commonSymptoms: ["seasonal headaches", "respiratory issues", "joint pain"],
    riskFactors: ["air quality", "weather changes", "pollen levels"],
    prevalence: 23.5
  });

  const [personalInsights, setPersonalInsights] = useState<PersonalizedInsight[]>([
    {
      title: "Symptom Pattern Identified",
      description: "Your symptoms tend to worsen on weekdays between 2-4 PM, suggesting work-related stress triggers.",
      priority: "high",
      actionable: true,
      recommendation: "Schedule brief relaxation breaks during peak stress hours."
    },
    {
      title: "Weather Sensitivity",
      description: "Your joint pain correlates with barometric pressure changes 72 hours in advance.",
      priority: "medium",
      actionable: true,
      recommendation: "Consider weather-based preventive care during pressure drops."
    },
    {
      title: "Recovery Pattern",
      description: "You typically recover 40% faster when staying hydrated and getting 7+ hours of sleep.",
      priority: "high",
      actionable: true,
      recommendation: "Prioritize hydration and sleep during symptom episodes."
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="text-healing-green w-5 h-5" />;
      case "worsening": return <AlertCircle className="text-alert-red w-5 h-5" />;
      case "stable": return <TrendingUp className="text-warning-amber w-5 h-5" />;
      default: return <TrendingUp className="text-gray-400 w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="text-medical-blue w-6 h-6" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Health Insights</h2>
          <p className="text-gray-600 text-sm">AI-powered analysis of your health patterns</p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Insights</TabsTrigger>
          <TabsTrigger value="trends">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="regional">Regional Data</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid gap-4">
            {personalInsights.map((insight, index) => (
              <Card key={index} className="border-l-4 border-l-medical-blue">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="text-medical-blue w-5 h-5" />
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    </div>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority} priority
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                  
                  {insight.actionable && insight.recommendation && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="text-medical-blue w-4 h-4 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-blue-800 mb-1">Recommendation</p>
                          <p className="text-sm text-blue-700">{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {trends.map((trend) => (
              <Card key={trend.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(trend.trend)}
                      <h3 className="font-semibold text-gray-900">{trend.pattern}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Confidence</span>
                      <p className="font-bold text-medical-blue">{trend.confidence}%</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{trend.description}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800">
                      <strong>Recommendation:</strong> {trend.recommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-medical-blue to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6" />
                <h3 className="text-lg font-semibold">AI Analysis Summary</h3>
              </div>
              <p className="text-blue-100 mb-4">
                Based on your symptom data, our AI has identified 2 significant patterns with high confidence. 
                These insights can help you better understand and manage your health.
              </p>
              <Button variant="secondary" size="sm">
                Generate Detailed Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="text-medical-blue w-5 h-5" />
                <span>Regional Health Trends - {regionalData.region}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Common Symptoms in Your Area</h4>
                  <div className="space-y-2">
                    {regionalData.commonSymptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Regional Risk Factors</h4>
                  <div className="space-y-2">
                    {regionalData.riskFactors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2 bg-orange-50 text-orange-700">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="text-medical-blue w-4 h-4" />
                  <span className="font-medium text-gray-800">Population Health</span>
                </div>
                <p className="text-sm text-gray-700">
                  {regionalData.prevalence}% of people in your region report similar symptoms. 
                  This data helps contextualize your health patterns within local trends.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-healing-green bg-opacity-10 border-healing-green">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-healing-green w-5 h-5 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Regional Health Alert</h4>
                  <p className="text-sm text-gray-700">
                    High pollen count expected this week. Consider preventive measures if you have respiratory sensitivities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}