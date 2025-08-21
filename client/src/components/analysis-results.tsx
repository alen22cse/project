import { TriangleAlert, ClipboardList, Zap, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@shared/schema";

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

export function AnalysisResults({ result, isAnalyzing }: AnalysisResultsProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "emergency":
        return "bg-red-50 border-red-200 text-red-800";
      case "medium":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "low":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getRiskIndicator = (level: string) => {
    switch (level) {
      case "emergency":
        return { color: "bg-alert-red", label: "EMERGENCY" };
      case "medium":
        return { color: "bg-warning-amber", label: "MEDIUM RISK" };
      case "low":
        return { color: "bg-healing-green", label: "LOW RISK" };
      default:
        return { color: "bg-gray-400", label: "UNKNOWN" };
    }
  };

  const getProbabilityBadgeColor = (probability: string) => {
    switch (probability) {
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-orange-100 text-orange-600";
      case "low":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-medical-blue"></div>
            <h3 className="text-lg font-semibold text-gray-900">Analyzing Symptoms...</h3>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6">
        {/* Placeholder Risk Assessment Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TriangleAlert className="text-gray-400 w-5 h-5" />
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          </div>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TriangleAlert className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Share your symptoms to get a personalized risk assessment</p>
          </div>
        </div>

        {/* Placeholder Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="text-healing-green w-5 h-5" />
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Download className="text-gray-400 w-5 h-5" />
                <div>
                  <div className="font-medium text-gray-400">Export Report</div>
                  <div className="text-sm text-gray-400">Share with your doctor</div>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-400 w-5 h-5" />
                <div>
                  <div className="font-medium text-gray-400">Schedule Consultation</div>
                  <div className="text-sm text-gray-400">Book telehealth appointment</div>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-gray-400 w-5 h-5" />
                <div>
                  <div className="font-medium text-gray-400">Symptom Tracker</div>
                  <div className="text-sm text-gray-400">Monitor over time</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const riskIndicator = getRiskIndicator(result.riskLevel);

  return (
    <div className="space-y-6">
      {/* Risk Assessment Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TriangleAlert className="text-warning-amber w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 border rounded-lg ${getRiskLevelColor(result.riskLevel)}`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${riskIndicator.color}`}></div>
              <span className="font-semibold">{riskIndicator.label}</span>
            </div>
            <p className="text-sm">
              {result.riskLevel === "emergency" 
                ? "This appears to be a medical emergency. Seek immediate medical attention."
                : result.riskLevel === "medium"
                ? "Your symptoms suggest a condition that should be evaluated by a healthcare provider within 24-48 hours."
                : "Your symptoms appear to be low risk but monitoring is recommended."
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
            <p className="text-gray-700 text-sm mb-3">{result.recommendedAction}</p>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-medical-blue text-white hover:bg-blue-700">
                Find Care
              </Button>
              {result.riskLevel === "emergency" && (
                <Button size="sm" variant="destructive" className="bg-alert-red hover:bg-red-600">
                  Call 911
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Symptom Analysis Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ClipboardList className="text-medical-blue w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Symptom Analysis</h3>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Symptoms:</span>
              <span className="text-gray-900">{result.symptoms.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Severity:</span>
              <span className={`font-medium ${
                result.severity === "severe" ? "text-alert-red" :
                result.severity === "moderate" ? "text-warning-amber" :
                "text-healing-green"
              }`}>
                {result.severity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-900">{result.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Onset:</span>
              <span className="text-gray-900">{result.onset}</span>
            </div>
            {result.triggers && result.triggers !== "no clear trigger" && (
              <div className="flex justify-between">
                <span className="text-gray-600">Triggers:</span>
                <span className="text-gray-900">{result.triggers}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Possible Conditions Card */}
      {result.suspectedConditions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ClipboardList className="text-medical-blue w-5 h-5" />
            <h3 className="text-lg font-semibold text-gray-900">Possible Conditions</h3>
          </div>
          
          <div className="space-y-3">
            {result.suspectedConditions.map((condition, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{condition.name}</h4>
                  <Badge className={`text-xs px-2 py-1 rounded ${getProbabilityBadgeColor(condition.probability)}`}>
                    {condition.probability}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{condition.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="text-healing-green w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        
        <div className="space-y-3">
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Download className="text-medical-blue w-5 h-5" />
              <div>
                <div className="font-medium text-gray-800">Export Report</div>
                <div className="text-sm text-gray-600">Share with your doctor</div>
              </div>
            </div>
          </button>

          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Calendar className="text-healing-green w-5 h-5" />
              <div>
                <div className="font-medium text-gray-800">Schedule Consultation</div>
                <div className="text-sm text-gray-600">Book telehealth appointment</div>
              </div>
            </div>
          </button>

          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-warning-amber w-5 h-5" />
              <div>
                <div className="font-medium text-gray-800">Symptom Tracker</div>
                <div className="text-sm text-gray-600">Monitor over time</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Medical Disclaimer */}
      {result.medicalDisclaimer && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Important:</strong> {result.medicalDisclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
