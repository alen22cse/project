import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface HospitalSearchRequest {
  latitude: number;
  longitude: number;
  radius: number;
}

interface Hospital {
  name: string;
  address: string;
  phone?: string;
  distance?: number;
  type: string;
  rating?: number;
  emergencyServices: boolean;
}

export async function searchNearbyHospitals(
  request: HospitalSearchRequest
): Promise<{ hospitals: Hospital[] }> {
  try {
    const prompt = `You are a medical facility locator service. Please provide a list of hospitals and medical facilities near the coordinates ${request.latitude}, ${request.longitude} within a ${request.radius/1000}km radius.

For each facility, provide:
1. Name of the hospital/clinic
2. Complete address
3. Phone number (if available)
4. Estimated distance in km
5. Type (General Hospital, Emergency Room, Urgent Care, Specialty Clinic, etc.)
6. Whether they have emergency services (true/false)
7. Rating out of 5 if known

Please prioritize:
- Hospitals with emergency services
- Closer facilities
- Higher-rated facilities
- General hospitals and trauma centers

Return the response as a JSON array of hospitals with this exact structure:
{
  "hospitals": [
    {
      "name": "Hospital Name",
      "address": "Complete address",
      "phone": "+1-xxx-xxx-xxxx",
      "distance": 2.3,
      "type": "General Hospital",
      "rating": 4.2,
      "emergencyServices": true
    }
  ]
}

Focus on providing realistic, helpful medical facility information for emergency or urgent care needs.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    
    // Validate and return structured response
    if (result.hospitals && Array.isArray(result.hospitals)) {
      return {
        hospitals: result.hospitals.map((hospital: any) => ({
          name: hospital.name || "Unknown Hospital",
          address: hospital.address || "Address not available",
          phone: hospital.phone || undefined,
          distance: hospital.distance || undefined,
          type: hospital.type || "Medical Facility",
          rating: hospital.rating || undefined,
          emergencyServices: hospital.emergencyServices || false,
        }))
      };
    }

    // Fallback response if parsing fails
    return {
      hospitals: [
        {
          name: "Emergency Services Available",
          address: "Call 911 for immediate emergency assistance",
          phone: "911",
          distance: 0,
          type: "Emergency Services",
          rating: 5,
          emergencyServices: true
        }
      ]
    };

  } catch (error) {
    console.error("Hospital search error:", error);
    
    // Return emergency fallback
    return {
      hospitals: [
        {
          name: "Emergency Services",
          address: "For life-threatening emergencies, call 911 immediately",
          phone: "911",
          distance: 0,
          type: "Emergency Response",
          rating: 5,
          emergencyServices: true
        }
      ]
    };
  }
}