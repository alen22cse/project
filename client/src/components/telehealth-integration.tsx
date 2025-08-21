import { useState } from "react";
import { Video, Phone, Calendar, Download, FileText, Clock, Star, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Provider {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  availableSlots: string[];
  consultationFee: number;
  languages: string[];
  verified: boolean;
}

interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  type: "video" | "phone" | "chat";
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export function TelehealthIntegration() {
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Internal Medicine",
      rating: 4.9,
      experience: "8+ years",
      location: "Boston, MA",
      availableSlots: ["Today 2:00 PM", "Tomorrow 10:00 AM", "Friday 3:30 PM"],
      consultationFee: 75,
      languages: ["English", "Spanish"],
      verified: true
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Neurology",
      rating: 4.8,
      experience: "12+ years",
      location: "New York, NY",
      availableSlots: ["Tomorrow 11:00 AM", "Thursday 9:00 AM", "Friday 2:00 PM"],
      consultationFee: 120,
      languages: ["English", "Mandarin"],
      verified: true
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      providerId: "1",
      providerName: "Dr. Sarah Johnson",
      date: "2024-01-25",
      time: "2:00 PM",
      type: "video",
      status: "scheduled",
      notes: "Follow-up on headache symptoms"
    }
  ]);

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingForm, setBookingForm] = useState({
    preferredDate: "",
    preferredTime: "",
    consultationType: "video",
    reasonForVisit: "",
    symptoms: "",
    urgency: "routine"
  });

  const handleBookAppointment = () => {
    if (!selectedProvider) return;
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      date: bookingForm.preferredDate,
      time: bookingForm.preferredTime,
      type: bookingForm.consultationType as "video" | "phone" | "chat",
      status: "scheduled",
      notes: bookingForm.reasonForVisit
    };
    
    setAppointments([newAppointment, ...appointments]);
    setSelectedProvider(null);
    setBookingForm({
      preferredDate: "",
      preferredTime: "",
      consultationType: "video",
      reasonForVisit: "",
      symptoms: "",
      urgency: "routine"
    });
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "phone": return <Phone className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-red-100 text-red-800";
      case "moderate": return "bg-orange-100 text-orange-800";
      case "routine": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Video className="text-medical-blue w-6 h-6" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Telehealth Services</h2>
          <p className="text-gray-600 text-sm">Connect with healthcare providers remotely</p>
        </div>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Find Provider</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
          <TabsTrigger value="reports">Health Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          {/* Quick Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Medicine</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Consultation Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="chat">Text Chat</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Provider List */}
          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                        {provider.verified && (
                          <Badge className="bg-healing-green text-white">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-medical-blue font-medium">{provider.specialty}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-warning-amber fill-current" />
                            <span>{provider.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{provider.experience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{provider.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Languages:</span>
                          {provider.languages.map((lang, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Next Available:</p>
                        <div className="flex flex-wrap gap-2">
                          {provider.availableSlots.slice(0, 3).map((slot, index) => (
                            <Badge key={index} className="bg-medical-blue text-white text-xs">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-gray-900 mb-2">${provider.consultationFee}</p>
                      <p className="text-sm text-gray-600 mb-4">per consultation</p>
                      
                      <Button 
                        onClick={() => setSelectedProvider(provider)}
                        className="bg-medical-blue text-white hover:bg-blue-700"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking Modal */}
          {selectedProvider && (
            <Card className="border-2 border-medical-blue">
              <CardHeader>
                <CardTitle>Book Appointment with {selectedProvider.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preferred Date</label>
                    <Input
                      type="date"
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preferred Time</label>
                    <Select value={bookingForm.preferredTime} onValueChange={(value) => setBookingForm({...bookingForm, preferredTime: value})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProvider.availableSlots.map((slot, index) => (
                          <SelectItem key={index} value={slot.split(' ').slice(-2).join(' ')}>
                            {slot.split(' ').slice(-2).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Consultation Type</label>
                  <Select value={bookingForm.consultationType} onValueChange={(value) => setBookingForm({...bookingForm, consultationType: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call (+$0)</SelectItem>
                      <SelectItem value="phone">Phone Call (-$10)</SelectItem>
                      <SelectItem value="chat">Text Chat (-$20)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Reason for Visit</label>
                  <Textarea
                    value={bookingForm.reasonForVisit}
                    onChange={(e) => setBookingForm({...bookingForm, reasonForVisit: e.target.value})}
                    placeholder="Describe your symptoms or reason for consultation..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button onClick={handleBookAppointment} className="bg-medical-blue text-white hover:bg-blue-700">
                    Confirm Booking - ${selectedProvider.consultationFee}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getConsultationIcon(appointment.type)}
                        <h3 className="font-semibold text-gray-900">{appointment.providerName}</h3>
                        <Badge className={appointment.status === "scheduled" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><Calendar className="w-4 h-4 inline mr-2" />{appointment.date} at {appointment.time}</p>
                        <p><FileText className="w-4 h-4 inline mr-2" />Type: {appointment.type} consultation</p>
                        {appointment.notes && <p>Notes: {appointment.notes}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {appointment.status === "scheduled" && (
                        <>
                          <Button size="sm" className="bg-healing-green text-white hover:bg-green-600 w-full">
                            <Video className="w-4 h-4 mr-2" />
                            Join Call
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            Reschedule
                          </Button>
                        </>
                      )}
                      {appointment.status === "completed" && (
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="text-medical-blue w-5 h-5" />
                <span>Health Reports & Summaries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Comprehensive Health Summary</h4>
                    <p className="text-sm text-gray-600">Generated from your symptom analysis and consultations</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Consultation Notes</h4>
                    <p className="text-sm text-gray-600">Notes and recommendations from recent appointments</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Medication History</h4>
                    <p className="text-sm text-gray-600">Prescribed medications and treatment plans</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}