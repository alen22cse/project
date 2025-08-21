import { useState } from "react";
import { Calendar, TrendingUp, Plus, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SymptomEntry {
  id: string;
  date: string;
  symptoms: string[];
  severity: "mild" | "moderate" | "severe";
  duration: string;
  triggers: string;
  notes: string;
  painLevel: number;
}

interface SymptomTrackerProps {
  sessionId: string;
}

export function SymptomTracker({ sessionId }: SymptomTrackerProps) {
  const [entries, setEntries] = useState<SymptomEntry[]>([
    {
      id: "1",
      date: "2024-01-20",
      symptoms: ["headache", "nausea"],
      severity: "moderate",
      duration: "3 hours",
      triggers: "stress, screen time",
      notes: "Started after long work session",
      painLevel: 6
    },
    {
      id: "2", 
      date: "2024-01-18",
      symptoms: ["headache"],
      severity: "mild",
      duration: "1 hour",
      triggers: "dehydration",
      notes: "Improved after drinking water",
      painLevel: 3
    }
  ]);

  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    symptoms: "",
    severity: "mild" as const,
    duration: "",
    triggers: "",
    notes: "",
    painLevel: 1
  });

  const handleAddEntry = () => {
    const entry: SymptomEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symptoms: newEntry.symptoms.split(',').map(s => s.trim()),
      severity: newEntry.severity,
      duration: newEntry.duration,
      triggers: newEntry.triggers,
      notes: newEntry.notes,
      painLevel: newEntry.painLevel
    };
    
    setEntries([entry, ...entries]);
    setNewEntry({
      symptoms: "",
      severity: "mild",
      duration: "",
      triggers: "",
      notes: "",
      painLevel: 1
    });
    setIsAddingEntry(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe": return "bg-red-100 text-red-800";
      case "moderate": return "bg-orange-100 text-orange-800";
      case "mild": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return "text-green-600";
    if (level <= 6) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="text-medical-blue w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Symptom Tracker</h2>
            <p className="text-gray-600 text-sm">Monitor your symptoms over time</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddingEntry(true)}
          className="bg-medical-blue text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Add New Entry Form */}
      {isAddingEntry && (
        <Card className="border-medical-blue border-2">
          <CardHeader>
            <CardTitle className="text-lg">Add Symptom Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Symptoms (comma separated)</label>
              <Input
                value={newEntry.symptoms}
                onChange={(e) => setNewEntry({...newEntry, symptoms: e.target.value})}
                placeholder="headache, nausea, dizziness"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Severity</label>
                <Select value={newEntry.severity} onValueChange={(value: string) => setNewEntry({...newEntry, severity: value as "mild" | "moderate" | "severe"})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <Input
                  value={newEntry.duration}
                  onChange={(e) => setNewEntry({...newEntry, duration: e.target.value})}
                  placeholder="2 hours, all day"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Pain Level (1-10)</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newEntry.painLevel}
                onChange={(e) => setNewEntry({...newEntry, painLevel: parseInt(e.target.value)})}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Triggers</label>
              <Input
                value={newEntry.triggers}
                onChange={(e) => setNewEntry({...newEntry, triggers: e.target.value})}
                placeholder="stress, food, weather"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                placeholder="Additional details..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleAddEntry} className="bg-medical-blue text-white hover:bg-blue-700">
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="text-medical-blue w-5 h-5" />
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="text-warning-amber w-5 h-5" />
              <div>
                <p className="text-sm text-gray-600">Avg Pain Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(entries.reduce((sum, entry) => sum + entry.painLevel, 0) / entries.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-alert-red w-5 h-5" />
              <div>
                <p className="text-sm text-gray-600">Severe Episodes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {entries.filter(e => e.severity === "severe").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Clock className="text-gray-400 w-4 h-4" />
                  <span className="text-sm text-gray-600">{entry.date}</span>
                  <Badge className={getSeverityColor(entry.severity)}>
                    {entry.severity}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Pain Level:</span>
                  <span className={`font-bold ${getPainLevelColor(entry.painLevel)}`}>
                    {entry.painLevel}/10
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Symptoms: </span>
                  <span className="text-sm text-gray-900">{entry.symptoms.join(", ")}</span>
                </div>
                
                {entry.duration && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Duration: </span>
                    <span className="text-sm text-gray-900">{entry.duration}</span>
                  </div>
                )}
                
                {entry.triggers && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Triggers: </span>
                    <span className="text-sm text-gray-900">{entry.triggers}</span>
                  </div>
                )}
                
                {entry.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Notes: </span>
                    <span className="text-sm text-gray-900">{entry.notes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}