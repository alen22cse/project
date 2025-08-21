import { apiRequest } from "./queryClient";
import type { SymptomAnalysisRequest, AnalysisResult, ChatMessage } from "@shared/schema";

export const api = {
  analyzeSymptoms: async (data: SymptomAnalysisRequest): Promise<AnalysisResult> => {
    const response = await apiRequest("POST", "/api/analyze-symptoms", data);
    return response.json();
  },

  getChatMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await apiRequest("GET", `/api/chat/${sessionId}`);
    return response.json();
  },

  sendChatMessage: async (content: string, sessionId: string, isUser: boolean): Promise<ChatMessage> => {
    const response = await apiRequest("POST", "/api/chat", {
      content,
      sessionId,
      isUser,
    });
    return response.json();
  },

  clearChatSession: async (sessionId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/chat/${sessionId}`);
  },

  getHealthRecords: async () => {
    const response = await apiRequest("GET", "/api/health-records");
    return response.json();
  },
};
