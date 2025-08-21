import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, Clock, Star, Navigation2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  rating: number;
  emergencyServices: boolean;
  specialties: string[];
  coordinates: { lat: number; lng: number };
  hours: string;
}

export function HospitalLocator() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // miles
  const [locationError, setLocationError] = useState<string>("");

  // Mock hospital data - in real app, this would come from Google Places API
  const mockHospitals: Hospital[] = [
    {
      id: "1",
      name: "City General Hospital",
      address: "123 Medical Center Dr, Boston, MA 02101",
      phone: "(617) 555-1234",
      distance: 2.3,
      rating: 4.2,
      emergencyServices: true,
      specialties: ["Emergency Medicine", "Cardiology", "Neurology"],
      coordinates: { lat: 42.3601, lng: -71.0589 },
      hours: "24/7 Emergency Services"
    },
    {
      id: "2", 
      name: "St. Mary's Medical Center",
      address: "456 Healthcare Blvd, Cambridge, MA 02139",
      phone: "(617) 555-5678",
      distance: 4.7,
      rating: 4.5,
      emergencyServices: true,
      specialties: ["Emergency Medicine", "Pediatrics", "Orthopedics"],
      coordinates: { lat: 42.3736, lng: -71.1097 },
      hours: "24/7 Emergency Services"
    },
    {
      id: "3",
      name: "Regional Urgent Care",
      address: "789 Quick Care Ave, Somerville, MA 02143",
      phone: "(617) 555-9012",
      distance: 3.1,
      rating: 3.8,
      emergencyServices: false,
      specialties: ["Urgent Care", "Primary Care", "Minor Procedures"],
      coordinates: { lat: 42.3875, lng: -71.0995 },
      hours: "7 AM - 11 PM Daily"
    }
  ];

  const requestLocation = () => {
    setLoading(true);
    setLocationError("");
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          // In real app, would make API call to find nearby hospitals
          setHospitals(mockHospitals.sort((a, b) => a.distance - b.distance));
          setLoading(false);
        },
        (error) => {
          setLocationError("Unable to access location. Please enable location services.");
          setLoading(false);
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  const openDirections = (hospital: Hospital) => {
    const destination = encodeURIComponent(hospital.address);
    if (location) {
      window.open(`https://www.google.com/maps/dir/${location.lat},${location.lng}/${destination}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/${destination}`, '_blank');
    }
  };

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  useEffect(() => {
    // Auto-request location on component mount for emergency use
    if (!location && !locationError) {
      requestLocation();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Location Controls */}
      <Card className="border-medical-blue">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="text-medical-blue w-5 h-5" />
            <span>Find Nearby Medical Facilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!location && !loading && (
            <Button 
              onClick={requestLocation}
              className="w-full bg-medical-blue text-white hover:bg-blue-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Use My Location to Find Hospitals
            </Button>
          )}
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-600">Getting your location...</p>
            </div>
          )}
          
          {locationError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">{locationError}</p>
              <Button 
                onClick={requestLocation}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {location && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✓ Location found! Showing hospitals within {searchRadius} miles
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Search Radius:</label>
            <Input
              type="number"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-20"
              min="1"
              max="50"
            />
            <span className="text-sm text-gray-600">miles</span>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Banner */}
      {hospitals.some(h => h.emergencyServices) && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Badge className="bg-red-600 text-white">EMERGENCY</Badge>
              <p className="text-red-800 font-medium">
                {hospitals.filter(h => h.emergencyServices).length} emergency facilities found nearby
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hospital List */}
      <div className="space-y-4">
        {hospitals.map((hospital) => (
          <Card key={hospital.id} className={hospital.emergencyServices ? "border-red-200" : "border-gray-200"}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                    {hospital.emergencyServices && (
                      <Badge className="bg-red-100 text-red-800">Emergency Services</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{hospital.address}</span>
                    </p>
                    
                    <p className="flex items-center space-x-1">
                      <Navigation className="w-4 h-4" />
                      <span>{hospital.distance} miles away</span>
                    </p>
                    
                    <p className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{hospital.hours}</span>
                    </p>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{hospital.rating}/5.0 rating</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hospital.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="text-right space-y-2 ml-4">
                  <Button 
                    onClick={() => callHospital(hospital.phone)}
                    className={hospital.emergencyServices ? "bg-red-600 hover:bg-red-700" : "bg-medical-blue hover:bg-blue-700"}
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  
                  <Button 
                    onClick={() => openDirections(hospital)}
                    variant="outline"
                    size="sm"
                    className="block w-full"
                  >
                    <Navigation2 className="w-4 h-4 mr-1" />
                    Directions
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Phone: {hospital.phone} | Estimated travel time will be shown in maps
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hospitals.length === 0 && !loading && !locationError && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Enable location access to find nearby medical facilities</p>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">How to Use Hospital Locator</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click "Use My Location" to find nearby hospitals automatically</li>
            <li>• Call button will directly dial the hospital's main number</li>
            <li>• Directions button opens maps with turn-by-turn navigation</li>
            <li>• Emergency facilities are highlighted in red for priority</li>
            <li>• Adjust search radius to find facilities further away if needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}