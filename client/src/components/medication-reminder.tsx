import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Plus, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Bell,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  lastTaken?: string;
  warnings?: string[];
}

export function MedicationReminder() {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Aspirin",
      dosage: "75mg",
      frequency: "Daily",
      time: "08:00",
      taken: false,
      warnings: ["Take with food", "May cause stomach irritation"]
    }
  ]);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    time: ""
  });

  useEffect(() => {
    // Check for medication reminders every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [medications]);

  const checkReminders = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    medications.forEach(med => {
      if (!med.taken && med.time === currentTime) {
        toast({
          title: "💊 Medication Reminder",
          description: `Time to take your ${med.name} (${med.dosage})`,
          duration: 10000,
        });
        
        // Show notification if browser supports it
        if (Notification.permission === "granted") {
          new Notification("HealthWhisper - Medication Reminder", {
            body: `Time to take your ${med.name} (${med.dosage})`,
            icon: "/pill-icon.png"
          });
        }
      }
    });
  };

  const addMedication = () => {
    if (newMed.name && newMed.dosage && newMed.time) {
      const medication: Medication = {
        id: Date.now().toString(),
        ...newMed,
        taken: false
      };
      setMedications(prev => [...prev, medication]);
      setNewMed({ name: "", dosage: "", frequency: "Daily", time: "" });
      
      toast({
        title: "Medication Added",
        description: `${newMed.name} has been added to your schedule.`,
      });
    }
  };

  const markAsTaken = (id: string) => {
    setMedications(prev => prev.map(med => 
      med.id === id 
        ? { ...med, taken: true, lastTaken: new Date().toISOString() }
        : med
    ));
    
    const med = medications.find(m => m.id === id);
    toast({
      title: "✅ Medication Taken",
      description: `${med?.name} marked as taken.`,
    });
  };

  const resetDaily = () => {
    setMedications(prev => prev.map(med => ({ ...med, taken: false })));
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive medication reminders.",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medication Reminders</h2>
          <p className="text-muted-foreground">
            Stay on track with your medication schedule
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={requestNotificationPermission}>
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
          <Button variant="outline" onClick={resetDaily}>
            <Calendar className="w-4 h-4 mr-2" />
            Reset Daily
          </Button>
        </div>
      </div>

      {/* Add New Medication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Medication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="med-name">Medication Name</Label>
              <Input
                id="med-name"
                value={newMed.name}
                onChange={(e) => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Aspirin"
              />
            </div>
            <div>
              <Label htmlFor="med-dosage">Dosage</Label>
              <Input
                id="med-dosage"
                value={newMed.dosage}
                onChange={(e) => setNewMed(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 75mg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="med-frequency">Frequency</Label>
              <select 
                id="med-frequency"
                className="w-full p-2 border rounded-md"
                value={newMed.frequency}
                onChange={(e) => setNewMed(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <option value="Daily">Daily</option>
                <option value="Twice Daily">Twice Daily</option>
                <option value="Three times Daily">Three times Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="As Needed">As Needed</option>
              </select>
            </div>
            <div>
              <Label htmlFor="med-time">Time</Label>
              <Input
                id="med-time"
                type="time"
                value={newMed.time}
                onChange={(e) => setNewMed(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={addMedication} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </CardContent>
      </Card>

      {/* Current Medications */}
      <div className="grid gap-4">
        {medications.map(med => (
          <Card key={med.id} className={`border-l-4 ${med.taken ? 'border-green-500 bg-green-50' : 'border-blue-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Pill className={`w-5 h-5 ${med.taken ? 'text-green-600' : 'text-blue-600'}`} />
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency} • {med.time}
                      </p>
                    </div>
                  </div>
                  
                  {med.warnings && med.warnings.length > 0 && (
                    <div className="mt-2 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div className="space-y-1">
                        {med.warnings.map((warning, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {warning}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {med.taken && med.lastTaken && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Taken at {new Date(med.lastTaken).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={med.taken ? "default" : "secondary"}>
                    {med.taken ? "Taken" : "Pending"}
                  </Badge>
                  {!med.taken && (
                    <Button 
                      size="sm" 
                      onClick={() => markAsTaken(med.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Taken
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {medications.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Medications Added</h3>
            <p className="text-muted-foreground">
              Add your medications above to start receiving reminders
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}