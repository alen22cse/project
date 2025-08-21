import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { User, Activity, Brain, TrendingUp, Zap, Heart, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DigitalTwin {
  id: string;
  name: string;
  baselineData: {
    age: number;
    weight: number;
    height: number;
    medicalHistory: string[];
    currentMedications: string[];
    allergies: string[];
    lifestyle: {
      sleepHours: number;
      exerciseFrequency: string;
      dietType: string;
      smoking: boolean;
      drinking: string;
    };
  };
  predictiveModel?: {
    healthScore: number;
    riskFactors: string[];
    recommendations: string[];
  };
}

interface TwinSimulation {
  id: string;
  simulationType: string;
  scenario: {
    changes: Record<string, any>;
    timeframe: string;
  };
  results?: {
    predictedOutcome: string;
    confidence: number;
    impactScore: number;
    recommendations: string[];
  };
}

export default function DigitalTwin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);
  const [simulation, setSimulation] = useState({
    type: "sleep",
    changes: { sleepHours: 8 },
    timeframe: "2_weeks"
  });

  const { data: twins = [] } = useQuery<DigitalTwin[]>({
    queryKey: ['/api/digital-twins'],
  });

  const deleteTwinMutation = useMutation({
    mutationFn: async (twinId: string) => 
      apiRequest('DELETE', `/api/digital-twins/${twinId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/digital-twins'] });
      toast({ title: "Digital Twin Deleted", description: "The digital twin has been removed from your account." });
    },
  });

  const { data: simulations = [] } = useQuery<TwinSimulation[]>({
    queryKey: ['/api/twin-simulations', selectedTwin],
    enabled: !!selectedTwin,
  });

  const createTwinMutation = useMutation({
    mutationFn: async (twinData: Partial<DigitalTwin>) => 
      apiRequest('POST', '/api/digital-twins', twinData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/digital-twins'] });
      toast({ title: "Digital Twin Created!", description: "Your health clone is ready for simulations." });
    },
  });

  const runSimulationMutation = useMutation({
    mutationFn: async (simData: any) => 
      apiRequest('POST', `/api/twin-simulations/${selectedTwin}`, simData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/twin-simulations', selectedTwin] });
      toast({ title: "Simulation Complete!", description: "Your health scenario prediction is ready." });
    },
  });

  const [twinForm, setTwinForm] = useState({
    name: "My Health Twin",
    age: 30,
    weight: 70,
    height: 170,
    medicalHistory: "",
    currentMedications: "",
    allergies: "",
    sleepHours: 7,
    exerciseFrequency: "moderate",
    dietType: "balanced",
    smoking: false,
    drinking: "occasionally"
  });

  const handleCreateTwin = () => {
    const twinData = {
      name: twinForm.name,
      baselineData: {
        age: twinForm.age,
        weight: twinForm.weight,
        height: twinForm.height,
        medicalHistory: twinForm.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: twinForm.currentMedications.split(',').map(s => s.trim()).filter(Boolean),
        allergies: twinForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
        lifestyle: {
          sleepHours: twinForm.sleepHours,
          exerciseFrequency: twinForm.exerciseFrequency,
          dietType: twinForm.dietType,
          smoking: twinForm.smoking,
          drinking: twinForm.drinking
        }
      }
    };
    createTwinMutation.mutate(twinData);
  };

  const handleRunSimulation = () => {
    runSimulationMutation.mutate({
      simulationType: simulation.type,
      scenario: {
        changes: simulation.changes,
        timeframe: simulation.timeframe
      }
    });
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Digital Twin Health Simulation</h2>
      </div>
      <p className="text-gray-600">Create a virtual copy of yourself to predict health outcomes and test lifestyle changes.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">My Twins</TabsTrigger>
          <TabsTrigger value="create">Create Twin</TabsTrigger>
          <TabsTrigger value="simulate">Run Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4">
            {twins.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No digital twins created yet</p>
                  <Button onClick={() => setActiveTab("create")}>Create Your First Twin</Button>
                </CardContent>
              </Card>
            ) : (
              twins.map((twin) => (
                <Card key={twin.id} className={selectedTwin === twin.id ? "ring-2 ring-blue-500" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {twin.name}
                        </CardTitle>
                        <CardDescription>
                          Age {twin.baselineData.age} • {twin.baselineData.weight}kg • {twin.baselineData.height}cm
                        </CardDescription>
                      </div>
                      <div className="flex items-start gap-2">
                        {twin.predictiveModel && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getHealthScoreColor(twin.predictiveModel.healthScore)}`}>
                              {twin.predictiveModel.healthScore}
                            </div>
                            <div className="text-sm text-gray-500">Health Score</div>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTwinMutation.mutate(twin.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <Heart className="w-3 h-3 mr-1" />
                          {twin.baselineData.lifestyle.sleepHours}h sleep
                        </Badge>
                        <Badge variant="outline">
                          <Activity className="w-3 h-3 mr-1" />
                          {twin.baselineData.lifestyle.exerciseFrequency}
                        </Badge>
                        <Badge variant="outline">{twin.baselineData.lifestyle.dietType} diet</Badge>
                      </div>

                      {twin.predictiveModel && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Health Score Breakdown</div>
                          <Progress value={twin.predictiveModel.healthScore} className="h-2" />
                          
                          {twin.predictiveModel.riskFactors.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-red-600 mb-1">Risk Factors</div>
                              <div className="flex flex-wrap gap-1">
                                {twin.predictiveModel.riskFactors.map((risk, i) => (
                                  <Badge key={i} variant="destructive" className="text-xs">{risk}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {twin.predictiveModel.recommendations.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-blue-600 mb-1">Recommendations</div>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {twin.predictiveModel.recommendations.slice(0, 2).map((rec, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <TrendingUp className="w-3 h-3 mt-0.5 text-blue-500" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedTwin(twin.id)}
                          variant={selectedTwin === twin.id ? "default" : "outline"}
                        >
                          {selectedTwin === twin.id ? "Selected" : "Select"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setActiveTab("simulate")}
                          disabled={!selectedTwin || selectedTwin !== twin.id}
                        >
                          Run Scenarios
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Digital Twin</CardTitle>
              <CardDescription>
                Provide your health data to create an AI-powered clone for health predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Twin Name</Label>
                  <Input 
                    value={twinForm.name}
                    onChange={(e) => setTwinForm({ ...twinForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input 
                    type="number"
                    value={twinForm.age}
                    onChange={(e) => setTwinForm({ ...twinForm, age: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input 
                    type="number"
                    value={twinForm.weight}
                    onChange={(e) => setTwinForm({ ...twinForm, weight: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input 
                    type="number"
                    value={twinForm.height}
                    onChange={(e) => setTwinForm({ ...twinForm, height: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Medical History (comma-separated)</Label>
                <Textarea 
                  placeholder="e.g., diabetes, hypertension, asthma"
                  value={twinForm.medicalHistory}
                  onChange={(e) => setTwinForm({ ...twinForm, medicalHistory: e.target.value })}
                />
              </div>

              <div>
                <Label>Current Medications (comma-separated)</Label>
                <Input 
                  placeholder="e.g., metformin, lisinopril"
                  value={twinForm.currentMedications}
                  onChange={(e) => setTwinForm({ ...twinForm, currentMedications: e.target.value })}
                />
              </div>

              <div>
                <Label>Allergies (comma-separated)</Label>
                <Input 
                  placeholder="e.g., penicillin, nuts, shellfish"
                  value={twinForm.allergies}
                  onChange={(e) => setTwinForm({ ...twinForm, allergies: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Lifestyle Information</h3>
                
                <div>
                  <Label>Sleep Hours: {twinForm.sleepHours}h</Label>
                  <Slider
                    value={[twinForm.sleepHours]}
                    onValueChange={([value]) => setTwinForm({ ...twinForm, sleepHours: value })}
                    max={12}
                    min={4}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Exercise Frequency</Label>
                    <Select value={twinForm.exerciseFrequency} onValueChange={(value) => setTwinForm({ ...twinForm, exerciseFrequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light (1-2 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-4 days/week)</SelectItem>
                        <SelectItem value="active">Active (5-6 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (Daily)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Diet Type</Label>
                    <Select value={twinForm.dietType} onValueChange={(value) => setTwinForm({ ...twinForm, dietType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="low_carb">Low Carb</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="high_protein">High Protein</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={twinForm.smoking}
                        onChange={(e) => setTwinForm({ ...twinForm, smoking: e.target.checked })}
                      />
                      Smoking
                    </Label>
                  </div>

                  <div>
                    <Label>Alcohol Consumption</Label>
                    <Select value={twinForm.drinking} onValueChange={(value) => setTwinForm({ ...twinForm, drinking: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="occasionally">Occasionally</SelectItem>
                        <SelectItem value="socially">Socially</SelectItem>
                        <SelectItem value="regularly">Regularly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateTwin}
                disabled={createTwinMutation.isPending}
                className="w-full"
              >
                {createTwinMutation.isPending ? "Creating Twin..." : "Create Digital Twin"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulate" className="space-y-6">
          {!selectedTwin ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Select a digital twin first to run simulations</p>
                <Button onClick={() => setActiveTab("profile")}>Go to My Twins</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    What-If Scenarios
                  </CardTitle>
                  <CardDescription>
                    Test how lifestyle changes might affect your health over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Scenario Type</Label>
                      <Select value={simulation.type} onValueChange={(value) => setSimulation({ ...simulation, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sleep">Sleep Changes</SelectItem>
                          <SelectItem value="diet">Diet Modification</SelectItem>
                          <SelectItem value="exercise">Exercise Routine</SelectItem>
                          <SelectItem value="weight">Weight Management</SelectItem>
                          <SelectItem value="medication">Medication Changes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Time Frame</Label>
                      <Select value={simulation.timeframe} onValueChange={(value) => setSimulation({ ...simulation, timeframe: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1_week">1 Week</SelectItem>
                          <SelectItem value="2_weeks">2 Weeks</SelectItem>
                          <SelectItem value="1_month">1 Month</SelectItem>
                          <SelectItem value="3_months">3 Months</SelectItem>
                          <SelectItem value="6_months">6 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {simulation.type === "sleep" && (
                    <div>
                      <Label>Target Sleep Hours: {simulation.changes.sleepHours || 8}h</Label>
                      <Slider
                        value={[simulation.changes.sleepHours || 8]}
                        onValueChange={([value]) => setSimulation({ 
                          ...simulation, 
                          changes: { ...simulation.changes, sleepHours: value }
                        })}
                        max={12}
                        min={4}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleRunSimulation}
                    disabled={runSimulationMutation.isPending}
                    className="w-full"
                  >
                    {runSimulationMutation.isPending ? "Running Simulation..." : "Run Scenario Analysis"}
                  </Button>
                </CardContent>
              </Card>

              {/* Simulation Results */}
              {simulations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Simulation Results</CardTitle>
                    <CardDescription>Your personalized health predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {simulations.map((sim) => (
                        <div key={sim.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium capitalize">
                                {sim.simulationType} Simulation
                              </div>
                              <div className="text-sm text-gray-500">
                                {sim.scenario.timeframe.replace('_', ' ')}
                              </div>
                            </div>
                            {sim.results && (
                              <Badge variant={sim.results.impactScore > 0 ? "default" : "secondary"}>
                                {sim.results.confidence}% confidence
                              </Badge>
                            )}
                          </div>
                          
                          {sim.results && (
                            <div className="space-y-2">
                              <div className="p-3 bg-blue-50 rounded">
                                <div className="font-medium text-blue-900">Predicted Outcome</div>
                                <p className="text-blue-800">{sim.results.predictedOutcome}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm">
                                  Impact Score: {sim.results.impactScore > 0 ? '+' : ''}{sim.results.impactScore}
                                </span>
                              </div>

                              {sim.results.recommendations.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-1">Recommendations</div>
                                  <ul className="space-y-1">
                                    {sim.results.recommendations.map((rec, i) => (
                                      <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}