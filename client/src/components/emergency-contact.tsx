import { Phone, MapPin, Navigation, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EmergencyContact() {
  const emergencyNumbers = {
    us: "911",
    uk: "999", 
    canada: "911",
    australia: "000",
    general: "112" // International emergency number
  };

  const handleEmergencyCall = (number: string) => {
    // Use tel: protocol to initiate phone call
    window.location.href = `tel:${number}`;
  };

  const handleLocationEmergency = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Open emergency services with location
          const emergencyUrl = `https://www.google.com/maps/search/emergency+hospital+near+me/@${latitude},${longitude},15z`;
          window.open(emergencyUrl, '_blank');
        },
        (error) => {
          console.error('Location access denied:', error);
          // Fallback to general emergency search
          window.open('https://www.google.com/maps/search/emergency+hospital+near+me', '_blank');
        }
      );
    } else {
      // Fallback for browsers without geolocation
      window.open('https://www.google.com/maps/search/emergency+hospital+near+me', '_blank');
    }
  };

  const poisonControlNumbers = {
    us: "1-800-222-1222",
    canada: "1-844-POISON-X",
    uk: "111" // NHS non-emergency
  };

  return (
    <div className="space-y-4">
      {/* Critical Emergency Alert */}
      <Card className="border-red-500 border-2 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="text-red-600 w-6 h-6" />
            <h3 className="text-lg font-bold text-red-800">Medical Emergency</h3>
          </div>
          <p className="text-red-700 text-sm mb-4">
            If you are experiencing a life-threatening emergency, call for immediate medical assistance.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={() => handleEmergencyCall(emergencyNumbers.us)}
              className="bg-red-600 text-white hover:bg-red-700 h-12"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call 911 (US/Canada)
            </Button>
            
            <Button 
              onClick={() => handleEmergencyCall(emergencyNumbers.general)}
              className="bg-red-600 text-white hover:bg-red-700 h-12"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call 112 (International)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Services with Location */}
      <Card className="border-orange-400">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="text-orange-600 w-5 h-5" />
            <span>Find Nearest Emergency Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleLocationEmergency}
            className="w-full bg-orange-600 text-white hover:bg-orange-700"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Find Nearest Hospital (Uses Your Location)
          </Button>
          
          <div className="text-sm text-gray-600">
            <p>This will:</p>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Access your location (with permission)</li>
              <li>• Open map with nearby hospitals</li>
              <li>• Show emergency departments</li>
              <li>• Provide directions and contact info</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Other Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Poison Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Poison Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => handleEmergencyCall(poisonControlNumbers.us)}
              variant="outline"
              className="w-full justify-start"
            >
              <Phone className="w-4 h-4 mr-2" />
              1-800-222-1222 (US)
            </Button>
            <p className="text-xs text-gray-600">24/7 poison emergency assistance</p>
          </CardContent>
        </Card>

        {/* Mental Health Crisis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mental Health Crisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => handleEmergencyCall("988")}
              variant="outline"
              className="w-full justify-start"
            >
              <Phone className="w-4 h-4 mr-2" />
              988 (Suicide & Crisis Lifeline)
            </Button>
            <p className="text-xs text-gray-600">24/7 mental health support</p>
          </CardContent>
        </Card>
      </div>

      {/* International Emergency Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">International Emergency Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="font-medium">UK</p>
              <Button 
                onClick={() => handleEmergencyCall("999")}
                variant="link"
                className="p-0 h-auto text-blue-600"
              >
                999
              </Button>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="font-medium">Australia</p>
              <Button 
                onClick={() => handleEmergencyCall("000")}
                variant="link"
                className="p-0 h-auto text-blue-600"
              >
                000
              </Button>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="font-medium">Europe</p>
              <Button 
                onClick={() => handleEmergencyCall("112")}
                variant="link"
                className="p-0 h-auto text-blue-600"
              >
                112
              </Button>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="font-medium">Japan</p>
              <Button 
                onClick={() => handleEmergencyCall("119")}
                variant="link"
                className="p-0 h-auto text-blue-600"
              >
                119
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Clock className="text-blue-600 w-5 h-5 mt-1" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Emergency Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Call emergency services immediately for life-threatening conditions</li>
                <li>• Stay calm and provide clear location information</li>
                <li>• Don't hang up until instructed by the operator</li>
                <li>• If possible, have someone meet emergency responders</li>
                <li>• Keep important medical information readily available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}