import { useState } from "react";
import { Heart, BarChart3, Brain, Video, Calendar, Settings, Bell, User, Cpu, Camera, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SymptomTracker } from "@/components/symptom-tracker";
import { TelehealthIntegration } from "@/components/telehealth-integration";
import { ChatInterface } from "@/components/chat-interface";
import { AnalysisResults } from "@/components/analysis-results";
import { ClinicalReportGenerator } from "@/components/clinical-report-generator";
import { EmergencyContact } from "@/components/emergency-contact";
import { HospitalLocator } from "@/components/hospital-locator";
import { PDFGenerator } from "@/components/pdf-generator";
import { HospitalFinder } from "@/components/hospital-finder";
import { HabitTracker } from "@/components/habit-tracker";
import { DynamicDashboardOverview } from "@/components/dynamic-dashboard-overview";
import DigitalTwin from "@/components/digital-twin";
import MultiModalAnalysis from "@/components/multi-modal-analysis";
import SecondOpinion from "@/components/second-opinion";
import { useAuth } from "@/hooks/useAuthSimple";
import type { AnalysisResult } from "@shared/schema";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sessionId] = useState(() => `dashboard-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user?.firstName ? `Hi, ${user.firstName}` : `Hi, ${user?.email}`}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 text-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Symptoms
              </TabsTrigger>
              <TabsTrigger value="tracker" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tracker
              </TabsTrigger>
              <TabsTrigger value="telehealth" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Telehealth
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="twin" className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                AI Twin
              </TabsTrigger>
              <TabsTrigger value="multimodal" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Multi-Modal
              </TabsTrigger>
              <TabsTrigger value="second-opinion" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                2nd Opinion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <DynamicDashboardOverview onViewAnalytics={() => setActiveTab("tracker")} />
            </TabsContent>

            <TabsContent value="symptoms" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SymptomTracker 
                  sessionId={sessionId}
                  analysisResult={analysisResult}
                />
                <ChatInterface 
                  sessionId={sessionId}
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnalysisStart={handleAnalysisStart}
                />
              </div>
              {analysisResult && (
                <AnalysisResults 
                  result={analysisResult}
                  isAnalyzing={isAnalyzing}
                />
              )}
            </TabsContent>

            <TabsContent value="tracker" className="space-y-6 mt-6">
              <HabitTracker />
            </TabsContent>


            <TabsContent value="telehealth" className="space-y-6 mt-6">
              <TelehealthIntegration />
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EmergencyContact />
                <HospitalFinder />
              </div>
            </TabsContent>

            <TabsContent value="twin" className="space-y-6 mt-6">
              <DigitalTwin />
            </TabsContent>

            <TabsContent value="multimodal" className="space-y-6 mt-6">
              <MultiModalAnalysis />
            </TabsContent>

            <TabsContent value="second-opinion" className="space-y-6 mt-6">
              <SecondOpinion />
            </TabsContent>
          </Tabs>
        </div>

      </main>
    </div>
  );
}