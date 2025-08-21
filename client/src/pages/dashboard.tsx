import { useState } from "react";
import { Heart, BarChart3, Brain, Video, Calendar, Settings, Bell, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SymptomTracker } from "@/components/symptom-tracker";
import { HealthInsights } from "@/components/health-insights";
import { TelehealthIntegration } from "@/components/telehealth-integration";
import { ChatInterface } from "@/components/chat-interface";
import { AnalysisResults } from "@/components/analysis-results";
import type { AnalysisResult } from "@shared/schema";

export default function Dashboard() {
  const [sessionId] = useState(() => `dashboard-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };

  return (
    <div className="min-h-screen bg-soft-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
                <Heart className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealthWhisper Dashboard</h1>
                <p className="text-xs text-gray-500">Comprehensive Health Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-medical-blue to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8" />
                <div>
                  <p className="text-blue-100 text-sm">Health Score</p>
                  <p className="text-2xl font-bold">85/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-healing-green to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8" />
                <div>
                  <p className="text-green-100 text-sm">Days Tracked</p>
                  <p className="text-2xl font-bold">28</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-warning-amber to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8" />
                <div>
                  <p className="text-orange-100 text-sm">AI Insights</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Video className="w-8 h-8" />
                <div>
                  <p className="text-purple-100 text-sm">Consultations</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
            <TabsTrigger value="tracker">Symptom Tracker</TabsTrigger>
            <TabsTrigger value="insights">Health Insights</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="text-medical-blue w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Brain className="text-medical-blue w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">AI Analysis Completed</p>
                      <p className="text-xs text-gray-600">Analyzed symptoms: headache, fatigue</p>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <BarChart3 className="text-healing-green w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Symptom Logged</p>
                      <p className="text-xs text-gray-600">Added new entry with severity: mild</p>
                    </div>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Video className="text-purple-600 w-5 h-5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Consultation Scheduled</p>
                      <p className="text-xs text-gray-600">Dr. Sarah Johnson - Tomorrow 2:00 PM</p>
                    </div>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                </CardContent>
              </Card>

              {/* Health Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="text-healing-green w-5 h-5" />
                    <span>Health Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Symptom Severity</span>
                      <Badge className="bg-green-100 text-green-800">Improving</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Sleep Quality</span>
                      <Badge className="bg-green-100 text-green-800">Good</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Stress Level</span>
                      <Badge className="bg-orange-100 text-orange-800">Moderate</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Activity Level</span>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-healing-green text-white hover:bg-green-600">
                    View Detailed Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col space-y-2 bg-medical-blue text-white hover:bg-blue-700">
                    <Brain className="w-6 h-6" />
                    <span>New Analysis</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col space-y-2 bg-healing-green text-white hover:bg-green-600">
                    <BarChart3 className="w-6 h-6" />
                    <span>Log Symptoms</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col space-y-2 bg-warning-amber text-white hover:bg-orange-600">
                    <Video className="w-6 h-6" />
                    <span>Book Consultation</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col space-y-2 bg-purple-600 text-white hover:bg-purple-700">
                    <Calendar className="w-6 h-6" />
                    <span>View Calendar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChatInterface 
                  sessionId={sessionId}
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnalysisStart={handleAnalysisStart}
                />
              </div>
              <div>
                <AnalysisResults 
                  result={analysisResult} 
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracker">
            <SymptomTracker />
          </TabsContent>

          <TabsContent value="insights">
            <HealthInsights />
          </TabsContent>

          <TabsContent value="telehealth">
            <TelehealthIntegration />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <h4 className="font-medium text-gray-900">Monthly Health Summary</h4>
                        <p className="text-sm text-gray-600">Comprehensive overview of your health trends</p>
                        <Badge className="mt-2 bg-green-100 text-green-800">Ready</Badge>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <h4 className="font-medium text-gray-900">Symptom Pattern Analysis</h4>
                        <p className="text-sm text-gray-600">AI-powered insights into your symptom patterns</p>
                        <Badge className="mt-2 bg-blue-100 text-blue-800">Ready</Badge>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <h4 className="font-medium text-gray-900">Provider Communication Log</h4>
                        <p className="text-sm text-gray-600">Summary of consultations and recommendations</p>
                        <Badge className="mt-2 bg-orange-100 text-orange-800">Updating</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
                    
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        Export to PDF
                      </Button>
                      
                      <Button className="w-full justify-start" variant="outline">
                        Send to Provider
                      </Button>
                      
                      <Button className="w-full justify-start" variant="outline">
                        Download CSV Data
                      </Button>
                      
                      <Button className="w-full justify-start" variant="outline">
                        Schedule Automated Reports
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}