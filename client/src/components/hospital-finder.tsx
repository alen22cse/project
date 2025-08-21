import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Phone, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hospital {
  name: string;
  address: string;
  phone?: string;
  distance?: number;
  type: string;
  rating?: number;
  emergencyServices: boolean;
}

export function HospitalFinder() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  const getUserLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  const searchNearbyHospitals = async () => {
    setIsSearching(true);
    try {
      // Get user location
      const location = await getUserLocation();
      setUserLocation(location);

      // Use Gemini API to search for hospitals
      const response = await fetch("/api/hospitals/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          radius: 25000 // 25km radius
        })
      });

      if (!response.ok) {
        throw new Error("Failed to search hospitals");
      }

      const data = await response.json();
      setHospitals(data.hospitals || []);

      toast({
        title: "Hospitals Found",
        description: `Found ${data.hospitals?.length || 0} hospitals near you`,
      });

    } catch (error) {
      console.error("Error searching hospitals:", error);
      
      // Fallback with demo data if API fails
      setHospitals([
        {
          name: "City General Hospital",
          address: "123 Main Street, Your City",
          phone: "+1 (555) 123-4567",
          distance: 2.3,
          type: "General Hospital",
          rating: 4.5,
          emergencyServices: true
        },
        {
          name: "Regional Medical Center",
          address: "456 Health Blvd, Your City",
          phone: "+1 (555) 234-5678",
          distance: 4.7,
          type: "Medical Center",
          rating: 4.2,
          emergencyServices: true
        },
        {
          name: "Emergency Care Clinic",
          address: "789 Care Ave, Your City",
          phone: "+1 (555) 345-6789",
          distance: 1.8,
          type: "Urgent Care",
          rating: 4.0,
          emergencyServices: false
        }
      ]);
      
      toast({
        title: "Location Error",
        description: "Showing sample hospitals. Please enable location access for accurate results.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    if (userLocation) {
      window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${encodedAddress}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Find Nearby Hospitals</h2>
          <p className="text-muted-foreground">Locate medical facilities near your location</p>
        </div>
        <Button 
          onClick={searchNearbyHospitals}
          disabled={isSearching}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {isSearching ? "Searching..." : "Find Hospitals"}
        </Button>
      </div>

      {hospitals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {hospitals.map((hospital, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{hospital.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {hospital.address}
                    </CardDescription>
                  </div>
                  {hospital.emergencyServices && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Emergency
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{hospital.type}</p>
                    {hospital.distance && (
                      <p className="text-sm font-medium">{hospital.distance} km away</p>
                    )}
                    {hospital.rating && (
                      <p className="text-sm">★ {hospital.rating}/5</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hospital.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => callHospital(hospital.phone!)}
                        className="flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => getDirections(hospital.address)}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hospitals.length === 0 && !isSearching && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Click "Find Hospitals" to search for medical facilities near you</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}