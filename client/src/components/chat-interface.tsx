import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Mic, Trash2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import type { ChatMessage, SymptomAnalysisRequest, AnalysisResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  sessionId: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisStart: () => void;
}

export function ChatInterface({ sessionId, onAnalysisComplete, onAnalysisStart }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch chat messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat', sessionId],
    queryFn: () => api.getChatMessages(sessionId),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ content, isUser }: { content: string; isUser: boolean }) =>
      api.sendChatMessage(content, sessionId, isUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Symptom analysis mutation
  const analyzeSymptomsMutation = useMutation({
    mutationFn: (data: SymptomAnalysisRequest) => api.analyzeSymptoms(data),
    onSuccess: (result) => {
      onAnalysisComplete(result);
      // Add AI response to chat
      sendMessageMutation.mutate({
        content: formatAnalysisResponse(result),
        isUser: false,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze symptoms",
        variant: "destructive",
      });
    },
  });

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: () => api.clearChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId] });
      toast({
        title: "Chat cleared",
        description: "Conversation has been cleared",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  // Add initial welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && !messagesLoading) {
      sendMessageMutation.mutate({
        content: "Hello! I'm here to help you understand your symptoms. Please describe what you've been experiencing, including when it started, how severe it is, and any triggers you've noticed.",
        isUser: false,
      });
    }
  }, [messages.length, messagesLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sendMessageMutation.isPending) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message
    await sendMessageMutation.mutateAsync({
      content: userMessage,
      isUser: true,
    });

    // Trigger symptom analysis
    onAnalysisStart();
    
    // Add thinking message
    await sendMessageMutation.mutateAsync({
      content: "I understand you're experiencing symptoms. Let me analyze what you've described...",
      isUser: false,
    });

    // Analyze symptoms
    analyzeSymptomsMutation.mutate({
      complaint: userMessage,
      userInfo: {
        // These could be collected from a form in a more complete implementation
        age: undefined,
        sex: undefined,
        existingConditions: undefined,
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatAnalysisResponse = (result: AnalysisResult): string => {
    return `Based on your symptoms, here's what I found:

**Symptoms Identified:** ${result.symptoms.join(", ")}
**Severity:** ${result.severity}
**Duration:** ${result.duration}
**Risk Level:** ${result.riskLevel.toUpperCase()}

**Recommendation:** ${result.recommendedAction}

${result.suspectedConditions.length > 0 ? 
  `**Possible Conditions:**\n${result.suspectedConditions.map(c => `• ${c.name} (${c.probability} probability)`).join('\n')}` 
  : ''
}

**Important:** ${result.medicalDisclaimer}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-medical-blue to-blue-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold">AI Health Assistant</h2>
            <p className="text-blue-100 text-sm">Describe your symptoms in your own words</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="h-96 p-6" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.isUser ? "justify-end" : ""
                }`}
              >
                {message.isUser ? (
                  <>
                    <div className="bg-medical-blue rounded-lg p-4 max-w-md text-white">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <span className="text-blue-100 text-xs mt-2 block">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-gray-600 w-4 h-4" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-white w-4 h-4" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-w-md">
                      <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
          
          {(sendMessageMutation.isPending || analyzeSymptomsMutation.isPending) && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white w-4 h-4" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-medical-blue"></div>
                  <p className="text-gray-800">Analyzing...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms in detail..."
            className="flex-1 border-gray-300 focus:ring-2 focus:ring-medical-blue focus:border-transparent"
            disabled={sendMessageMutation.isPending || analyzeSymptomsMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sendMessageMutation.isPending || analyzeSymptomsMutation.isPending}
            className="bg-medical-blue text-white hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
        <div className="flex items-center space-x-4 mt-3">
          <button className="text-gray-500 hover:text-medical-blue transition-colors text-sm">
            <Mic className="w-4 h-4 mr-1 inline" />
            Voice
          </button>
          <button
            onClick={() => clearChatMutation.mutate()}
            disabled={clearChatMutation.isPending}
            className="text-gray-500 hover:text-medical-blue transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1 inline" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
