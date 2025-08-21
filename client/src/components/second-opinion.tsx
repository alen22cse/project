import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      toast({ 
        title: "Second Opinion Complete!", 
        description: "AI analysis of your medical diagnosis is ready." 
      });
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

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold">AI-Powered Second Opinion</h2>
      </div>
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
        {/* Input Form */}
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
                placeholder="e.g., Acute bronchitis with secondary bacterial infection..."
                value={formData.doctorDiagnosis}
                onChange={(e) => setFormData({ ...formData, doctorDiagnosis: e.target.value })}
                className="min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="symptoms">Your Symptoms (Optional)</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe your symptoms in your own words..."
                value={formData.patientSymptoms}
                onChange={(e) => setFormData({ ...formData, patientSymptoms: e.target.value })}
                className="min-h-20"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Prescribed Medications</Label>
                <Button size="sm" variant="outline" onClick={addMedication}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              <div className="space-y-3">
                {formData.medications.map((medication, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm">Medication {index + 1}</div>
                      {formData.medications.length > 1 && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Medication Name</Label>
                        <Input
                          placeholder="e.g., Amoxicillin"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Dosage</Label>
                        <Input
                          placeholder="e.g., 500mg"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Frequency</Label>
                        <Input
                          placeholder="e.g., 3 times daily"
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Duration</Label>
                        <Input
                          placeholder="e.g., 7 days"
                          value={medication.duration}
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

        {/* Previous Opinions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Previous Second Opinions</h3>
          
          {opinions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No second opinions yet</p>
                <p className="text-sm text-gray-500">Submit your first medical analysis</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {opinions.map((opinion) => (
                <Card key={opinion.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      {opinion.doctorDiagnosis.length > 50 
                        ? `${opinion.doctorDiagnosis.substring(0, 50)}...`
                        : opinion.doctorDiagnosis
                      }
                    </CardTitle>
                    <CardDescription>
                      {new Date(opinion.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {opinion.prescribedMedications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {opinion.prescribedMedications.map((med, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Pill className="w-3 h-3 mr-1" />
                            {med.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {opinion.aiAnalysis && (
                      <div className="text-sm text-gray-600">
                        Analysis completed • {opinion.aiAnalysis.medicationAnalysis.length} medications analyzed
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analysis Results */}
      {opinions.length > 0 && opinions[0].aiAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Latest AI Analysis Results
            </CardTitle>
            <CardDescription>
              Comprehensive breakdown of your medical treatment plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Diagnosis Explanation */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Diagnosis Explanation
                </h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-900">{opinions[0].aiAnalysis.diagnosisExplanation}</p>
                </div>
              </div>

              {/* Medication Analysis */}
              {opinions[0].aiAnalysis.medicationAnalysis.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Medication Breakdown
                  </h4>
                  <div className="space-y-4">
                    {opinions[0].aiAnalysis.medicationAnalysis.map((med, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <h5 className="font-medium">{med.name}</h5>
                          <Badge variant="outline">{med.purpose}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {med.sideEffects.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-orange-700 mb-2">Side Effects</div>
                              <ul className="text-sm space-y-1">
                                {med.sideEffects.map((effect, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="w-1 h-1 bg-orange-400 rounded-full mt-2"></span>
                                    {effect}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {med.interactions.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-red-700 mb-2">Drug Interactions</div>
                              <ul className="text-sm space-y-1">
                                {med.interactions.map((interaction, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5" />
                                    {interaction}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {med.precautions.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-blue-700 mb-2">Precautions</div>
                              <ul className="text-sm space-y-1">
                                {med.precautions.map((precaution, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <Info className="w-3 h-3 text-blue-500 mt-0.5" />
                                    {precaution}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alternative Options */}
                {opinions[0].aiAnalysis.alternativeOptions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Alternative Treatment Options
                    </h4>
                    <ul className="space-y-2">
                      {opinions[0].aiAnalysis.alternativeOptions.map((option, i) => (
                        <li key={i} className="text-sm p-3 bg-green-50 rounded-lg">
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Red Flags */}
                {opinions[0].aiAnalysis.redFlags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Warning Signs to Watch
                    </h4>
                    <ul className="space-y-2">
                      {opinions[0].aiAnalysis.redFlags.map((flag, i) => (
                        <li key={i} className="text-sm p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Questions to Ask Doctor */}
              {opinions[0].aiAnalysis.questions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Questions to Ask Your Doctor
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <ul className="space-y-2">
                      {opinions[0].aiAnalysis.questions.map((question, i) => (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}