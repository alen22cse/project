import { useState, useEffect } from "react";
import { Heart, Menu, TriangleAlert, Download, Calendar, TrendingUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat-interface";
import { AnalysisResults } from "@/components/analysis-results";
import type { AnalysisResult } from "@shared/schema";

export default function Home() {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
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
    <div className="font-inter bg-soft-gray min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
                <Heart className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealthWhisper</h1>
                <p className="text-xs text-gray-500">AI Health Companion</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-medical-blue transition-colors">How it Works</a>
              <a href="#" className="text-gray-600 hover:text-medical-blue transition-colors">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-medical-blue transition-colors">Support</a>
              <a href="/dashboard" className="text-gray-600 hover:text-medical-blue transition-colors">Dashboard</a>
              <Button className="bg-medical-blue text-white hover:bg-blue-700">
                Sign In
              </Button>
            </nav>
            <button className="md:hidden text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Medical Disclaimer Banner */}
      <div className="bg-yellow-50 border-l-4 border-warning-amber p-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <TriangleAlert className="text-warning-amber w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface 
              sessionId={sessionId}
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
            />
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            <AnalysisResults 
              result={analysisResult} 
              isAnalyzing={isAnalyzing}
            />

            {/* Emergency Contact Card */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Phone className="text-alert-red w-5 h-5" />
                <h3 className="text-lg font-semibold text-red-800">Emergency Contact</h3>
              </div>
              <p className="text-red-700 text-sm mb-4">
                If you experience severe symptoms like difficulty breathing, severe chest pain, or loss of consciousness, call emergency services immediately.
              </p>
              <Button className="w-full bg-alert-red text-white hover:bg-red-600">
                <Phone className="w-4 h-4 mr-2" />
                Call 911
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-medical-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-medical-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a18.835 18.835 0 01-2.62 2.982C4.045 15.814 2.917 16 2 16a1 1 0 100-2c.417 0 .958-.086 1.544-.279a16.836 16.836 0 002.302-2.208c-.403-.394-.812-.81-1.207-1.251a1 1 0 111.44-1.389c.151.156.296.308.434.456.332-.651.621-1.34.842-2.063C6.756 6.924 6.16 6.498 5.304 6.498a1 1 0 110-2C7.201 4.498 8 5.814 8 7.304V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multilingual Support</h3>
            <p className="text-gray-600 text-sm">Available in 12+ languages with cultural context understanding</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-healing-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-healing-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
            <p className="text-gray-600 text-sm">Your health data is encrypted and protected with enterprise-grade security</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-warning-amber bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-warning-amber" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600 text-sm">Advanced NLP models trained on medical literature and clinical data</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
                  <Heart className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-gray-900">HealthWhisper</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                AI-powered health companion that helps you understand your symptoms and connect with appropriate care. Not a replacement for professional medical advice.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-medical-blue transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-medical-blue transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-medical-blue transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-medical-blue transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Accuracy</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-medical-blue transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Medical Disclaimer</a></li>
                <li><a href="#" className="hover:text-medical-blue transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-center text-gray-500 text-sm">
              © 2024 HealthWhisper. All rights reserved. This service is not intended to replace professional medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
