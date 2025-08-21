import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Pill, AlertTriangle, CheckCircle, Info, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface SecondOpinion {
  id: string;
  doctorDiagnosis: string;
  prescribedMedications: Medication[];
  patientSymptoms: string;
  aiAnalysis?: {
    diagnosisExplanation: string;
    medicationAnalysis: {
      name: string;
      purpose: string;
      sideEffects: string[];
      interactions: string[];
      precautions: string[];
    }[];
    alternativeOptions: string[];
    redFlags: string[];
    questions: string[];
  };
  createdAt: string;
}

export default function SecondOpinion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("new-opinion");
  
  const [formData, setFormData] = useState({
    doctorDiagnosis: "",
    patientSymptoms: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }] as Medication[]
  });

  const { data: opinions = [] } = useQuery<SecondOpinion[]>({
    queryKey: ['/api/second-opinions'],
  });

  const analyzeOpinionMutation = useMutation({
    mutationFn: async (data: any) => 
      apiRequest('POST', '/api/second-opinions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/second-opinions'] });
      setFormData({
        doctorDiagnosis: "",
        patientSymptoms: "",
        medications: [{ name: "", dosage: "", frequency: "", duration: "" }]
      });
      setActiveTab("history"); // Switch to history tab to show results
      toast({ 
        title: "Second Opinion Complete!", 
        description: "AI analysis of your medical diagnosis is ready." 
      });
    },
  });

  const deleteOpinionMutation = useMutation({
    mutationFn: async (opinionId: string) => 
      apiRequest('DELETE', `/api/second-opinions/${opinionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/second-opinions'] });
      toast({ title: "Opinion Deleted", description: "The second opinion has been removed from your history." });
    },
  });

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: "", dosage: "", frequency: "", duration: "" }]
    });
  };

  const removeMedication = (index: number) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setFormData({ ...formData, medications: newMedications });
  };

  const handleSubmit = () => {
    const validMedications = formData.medications.filter(med => med.name.trim());
    
    if (!formData.doctorDiagnosis.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the doctor's diagnosis.",
        variant: "destructive"
      });
      return;
    }

    analyzeOpinionMutation.mutate({
      doctorDiagnosis: formData.doctorDiagnosis,
      patientSymptoms: formData.patientSymptoms,
      prescribedMedications: validMedications
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold">AI-Powered Second Opinion</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-opinion" className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            New Analysis
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            History ({opinions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-opinion" className="space-y-6 mt-6">
          <p className="text-gray-600">
            Get AI analysis of medical diagnoses and prescriptions to better understand your treatment plan.
          </p>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This AI second opinion is for educational purposes only and should never replace professional medical advice. 
              Always discuss any concerns with your healthcare provider.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Medical Information</CardTitle>
                <CardDescription>
                  Provide details from your doctor's visit for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="diagnosis">Doctor's Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter the diagnosis provided by your doctor..."
                    value={formData.doctorDiagnosis}
                    onChange={(e) => setFormData({...formData, doctorDiagnosis: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="symptoms">Your Symptoms (Optional)</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe your symptoms and how you're feeling..."
                    value={formData.patientSymptoms}
                    onChange={(e) => setFormData({...formData, patientSymptoms: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Prescribed Medications</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addMedication}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.medications.map((med, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Medication {index + 1}</span>
                          {formData.medications.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMedication(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Name *</Label>
                            <Input
                              placeholder="e.g., Lisinopril"
                              value={med.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Dosage</Label>
                            <Input
                              placeholder="e.g., 10mg"
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Frequency</Label>
                            <Input
                              placeholder="e.g., Once daily"
                              value={med.frequency}
                              onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Duration</Label>
                            <Input
                              placeholder="e.g., 30 days"
                              value={med.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={analyzeOpinionMutation.isPending}
                  className="w-full"
                >
                  {analyzeOpinionMutation.isPending ? "Analyzing..." : "Get AI Second Opinion"}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Diagnosis Analysis</p>
                      <p>Clear explanation of your diagnosis in simple terms</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Medication Review</p>
                      <p>Purpose, side effects, and precautions for each medication</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Alternative Options</p>
                      <p>Other treatment approaches you might discuss with your doctor</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Red Flags</p>
                      <p>Important symptoms or concerns to watch for</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {opinions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No second opinions yet</p>
                <p className="text-sm text-gray-500">Get AI analysis of medical diagnoses using the "New Analysis" tab</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {opinions.map((opinion) => (
                <Card key={opinion.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5" />
                          Second Opinion Analysis
                        </CardTitle>
                        <CardDescription>
                          {new Date(opinion.createdAt).toLocaleDateString()} at{' '}
                          {new Date(opinion.createdAt).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOpinionMutation.mutate(opinion.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Original Diagnosis:</h4>
                      <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{opinion.doctorDiagnosis}</p>
                    </div>
                    
                    {opinion.aiAnalysis && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">AI Explanation:</h4>
                          <p className="text-gray-700">{opinion.aiAnalysis.diagnosisExplanation}</p>
                        </div>

                        {opinion.aiAnalysis.medicationAnalysis.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Medication Analysis:</h4>
                            <div className="space-y-3">
                              {opinion.aiAnalysis.medicationAnalysis.map((med, i) => (
                                <div key={i} className="p-3 border rounded-lg">
                                  <h5 className="font-medium text-blue-700">{med.name}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{med.purpose}</p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                    <div>
                                      <span className="text-xs font-medium text-gray-500">Side Effects:</span>
                                      <ul className="text-xs text-gray-600 mt-1">
                                        {med.sideEffects.slice(0, 3).map((effect, j) => (
                                          <li key={j}>• {effect}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-gray-500">Interactions:</span>
                                      <ul className="text-xs text-gray-600 mt-1">
                                        {med.interactions.slice(0, 3).map((interaction, j) => (
                                          <li key={j}>• {interaction}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-gray-500">Precautions:</span>
                                      <ul className="text-xs text-gray-600 mt-1">
                                        {med.precautions.slice(0, 3).map((precaution, j) => (
                                          <li key={j}>• {precaution}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {opinion.aiAnalysis.alternativeOptions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                              Alternative Treatment Options
                            </h4>
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <ul className="space-y-1">
                                {opinion.aiAnalysis.alternativeOptions.map((option, i) => (
                                  <li key={i} className="text-sm text-blue-800">• {option}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {opinion.aiAnalysis.redFlags.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              Important Warning Signs
                            </h4>
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <ul className="space-y-1">
                                {opinion.aiAnalysis.redFlags.map((flag, i) => (
                                  <li key={i} className="text-sm text-red-700 font-medium">• {flag}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {opinion.aiAnalysis.questions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              Questions to Ask Your Doctor
                            </h4>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <ul className="space-y-2">
                                {opinion.aiAnalysis.questions.map((question, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="font-medium text-blue-600">{i + 1}.</span>
                                    {question}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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