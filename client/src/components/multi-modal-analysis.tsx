import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mic, Camera, FileText, Upload, Play, Pause, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MultiModalAnalysis {
  id: string;
  analysisType: string;
  textInput?: string;
  voiceFileUrl?: string;
  imageFileUrl?: string;
  extractedData?: {
    symptoms: string[];
    severity: string;
    bodyParts: string[];
    visualFindings?: string[];
    speechAnalysis?: {
      emotionalState: string;
      painLevel: number;
      clarity: string;
    };
  };
  aiAnalysis?: {
    diagnosis: string[];
    urgency: string;
    recommendations: string[];
    confidence: number;
  };
  createdAt: string;
}

export default function MultiModalAnalysis() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: analyses = [] } = useQuery<MultiModalAnalysis[]>({
    queryKey: ['/api/multimodal-analysis'],
  });

  const analyzeTextMutation = useMutation({
    mutationFn: async (text: string) => 
      apiRequest('POST', '/api/multimodal-analysis/text', { textInput: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/multimodal-analysis'] });
      setTextInput("");
      toast({ title: "Analysis Complete!", description: "Your symptoms have been analyzed using AI." });
    },
  });

  const analyzeVoiceMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      return fetch('/api/multimodal-analysis/voice', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/multimodal-analysis'] });
      setRecordedAudio(null);
      toast({ title: "Voice Analysis Complete!", description: "Your voice recording has been processed and analyzed." });
    },
  });

  const analyzeImageMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return fetch('/api/multimodal-analysis/image', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/multimodal-analysis'] });
      setUploadedImage(null);
      setImagePreview(null);
      toast({ title: "Image Analysis Complete!", description: "Your image has been processed for visual symptoms." });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({ 
        title: "Recording Failed", 
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive" 
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'text-red-600';
      case 'urgent': return 'text-orange-600';
      case 'moderate': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'urgent': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Multi-Modal Symptom Analysis</h2>
      </div>
      <p className="text-gray-600">Describe symptoms through text, voice, or images for comprehensive AI analysis.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Image
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Text Symptom Description
              </CardTitle>
              <CardDescription>
                Describe your symptoms in detail using natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I've been having a persistent headache for 3 days, along with nausea and sensitivity to light. The pain is mostly on the right side of my head and gets worse when I move around..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-32"
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {textInput.length}/1000 characters
                </div>
                <Button
                  onClick={() => analyzeTextMutation.mutate(textInput)}
                  disabled={!textInput.trim() || analyzeTextMutation.isPending}
                >
                  {analyzeTextMutation.isPending ? "Analyzing..." : "Analyze Text"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Symptom Recording
              </CardTitle>
              <CardDescription>
                Record yourself describing your symptoms for voice analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                {!isRecording && !recordedAudio && (
                  <div>
                    <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Click to start recording your symptoms</p>
                    <Button onClick={startRecording}>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                )}

                {isRecording && (
                  <div>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-red-600 mb-4">Recording in progress...</p>
                    <Button onClick={stopRecording} variant="destructive">
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                )}

                {recordedAudio && (
                  <div>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Recording complete! Ready for analysis.</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={() => analyzeVoiceMutation.mutate(recordedAudio)}
                        disabled={analyzeVoiceMutation.isPending}
                      >
                        {analyzeVoiceMutation.isPending ? "Analyzing..." : "Analyze Voice"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setRecordedAudio(null);
                        }}
                      >
                        Record Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Voice Analysis Features:</h4>
                <ul className="space-y-1">
                  <li>• Speech-to-text conversion with medical terminology</li>
                  <li>• Emotional state detection (stress, anxiety, pain levels)</li>
                  <li>• Voice quality analysis for respiratory symptoms</li>
                  <li>• Natural language processing for symptom extraction</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Visual Symptom Analysis
              </CardTitle>
              <CardDescription>
                Upload images of visible symptoms, rashes, wounds, or meal photos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                {!imagePreview ? (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload an image for visual analysis</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <img 
                      src={imagePreview} 
                      alt="Uploaded symptom" 
                      className="max-w-full max-h-64 mx-auto mb-4 rounded-lg"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => uploadedImage && analyzeImageMutation.mutate(uploadedImage)}
                        disabled={analyzeImageMutation.isPending}
                      >
                        {analyzeImageMutation.isPending ? "Analyzing..." : "Analyze Image"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setUploadedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        Upload Different Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-gray-500 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800">Good for Analysis:</h4>
                  <ul className="space-y-1">
                    <li>• Skin conditions (rashes, moles, lesions)</li>
                    <li>• Wounds and injuries</li>
                    <li>• Swelling or discoloration</li>
                    <li>• Eye conditions</li>
                    <li>• Meal photos for dietary analysis</li>
                  </ul>
                </div>

                <div className="text-sm text-gray-500 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-yellow-800">Privacy & Safety:</h4>
                  <ul className="space-y-1">
                    <li>• Images are analyzed locally when possible</li>
                    <li>• No permanent storage of sensitive images</li>
                    <li>• HIPAA-compliant processing</li>
                    <li>• Always consult professionals for serious conditions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No analyses performed yet</p>
                <p className="text-sm text-gray-500">Use the other tabs to analyze your symptoms</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {analysis.analysisType === 'text' && <FileText className="w-5 h-5" />}
                          {analysis.analysisType === 'voice' && <Mic className="w-5 h-5" />}
                          {analysis.analysisType === 'image' && <Camera className="w-5 h-5" />}
                          {analysis.analysisType.charAt(0).toUpperCase() + analysis.analysisType.slice(1)} Analysis
                        </CardTitle>
                        <CardDescription>
                          {new Date(analysis.createdAt).toLocaleDateString()} at{' '}
                          {new Date(analysis.createdAt).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      {analysis.aiAnalysis && (
                        <div className="flex items-center gap-2">
                          {getUrgencyIcon(analysis.aiAnalysis.urgency)}
                          <span className={`text-sm font-medium ${getUrgencyColor(analysis.aiAnalysis.urgency)}`}>
                            {analysis.aiAnalysis.urgency}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Extracted Data */}
                      {analysis.extractedData && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-3">Extracted Information</h4>
                          <div className="space-y-2">
                            {analysis.extractedData.symptoms.length > 0 && (
                              <div>
                                <span className="text-sm font-medium">Symptoms: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {analysis.extractedData.symptoms.map((symptom, i) => (
                                    <Badge key={i} variant="secondary">{symptom}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {analysis.extractedData.severity && (
                              <div>
                                <span className="text-sm font-medium">Severity: </span>
                                <Badge variant="outline">{analysis.extractedData.severity}</Badge>
                              </div>
                            )}

                            {analysis.extractedData.bodyParts.length > 0 && (
                              <div>
                                <span className="text-sm font-medium">Affected Areas: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {analysis.extractedData.bodyParts.map((part, i) => (
                                    <Badge key={i} variant="outline">{part}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {analysis.extractedData.speechAnalysis && (
                              <div>
                                <span className="text-sm font-medium">Speech Analysis: </span>
                                <div className="text-sm text-gray-600 mt-1">
                                  Emotional State: {analysis.extractedData.speechAnalysis.emotionalState} • 
                                  Pain Level: {analysis.extractedData.speechAnalysis.painLevel}/10 • 
                                  Clarity: {analysis.extractedData.speechAnalysis.clarity}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* AI Analysis */}
                      {analysis.aiAnalysis && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">AI Analysis</h4>
                            <Badge variant="outline">{analysis.aiAnalysis.confidence}% confidence</Badge>
                          </div>

                          {analysis.aiAnalysis.diagnosis.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Possible Conditions:</div>
                              <div className="space-y-1">
                                {analysis.aiAnalysis.diagnosis.map((diag, i) => (
                                  <div key={i} className="text-sm p-2 bg-blue-50 rounded">
                                    {diag}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {analysis.aiAnalysis.recommendations.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Recommendations:</div>
                              <ul className="space-y-1">
                                {analysis.aiAnalysis.recommendations.map((rec, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 mt-0.5 text-green-600" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Original Input */}
                      {analysis.textInput && (
                        <div className="pt-3 border-t">
                          <div className="text-sm font-medium mb-1">Original Description:</div>
                          <p className="text-sm text-gray-600">{analysis.textInput}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}