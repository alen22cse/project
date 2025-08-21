import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { AnalysisResult } from "@shared/schema";

interface PDFGeneratorProps {
  analysisResult: AnalysisResult | null;
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
  };
}

export function PDFGenerator({ analysisResult, patientInfo }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!analysisResult) {
      toast({
        title: "No Analysis Available",
        description: "Please complete a symptom analysis first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text("HealthWhisper Medical Report", 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      if (patientInfo?.name) {
        pdf.text(`Patient: ${patientInfo.name}`, 20, 55);
      }
      if (patientInfo?.age) {
        pdf.text(`Age: ${patientInfo.age}`, 20, 65);
      }
      if (patientInfo?.gender) {
        pdf.text(`Gender: ${patientInfo.gender}`, 20, 75);
      }
      
      // Analysis Results
      let yPosition = 95;
      
      pdf.setFontSize(16);
      pdf.text("Symptom Analysis", 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      if (analysisResult.symptoms.length > 0) {
        pdf.text("Reported Symptoms:", 20, yPosition);
        yPosition += 10;
        analysisResult.symptoms.forEach((symptom, index) => {
          pdf.text(`• ${symptom}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 5;
      }
      
      pdf.text(`Severity: ${analysisResult.severity}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Risk Level: ${analysisResult.riskLevel}`, 20, yPosition);
      yPosition += 10;
      
      if (analysisResult.duration) {
        pdf.text(`Duration: ${analysisResult.duration}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Recommendations
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.text("Recommended Action", 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      const recommendationLines = pdf.splitTextToSize(analysisResult.recommendedAction, 170);
      pdf.text(recommendationLines, 20, yPosition);
      yPosition += recommendationLines.length * 8 + 10;
      
      // Suspected Conditions
      if (analysisResult.suspectedConditions.length > 0) {
        pdf.setFontSize(16);
        pdf.text("Possible Conditions", 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        analysisResult.suspectedConditions.forEach((condition) => {
          pdf.text(`• ${condition.name} (${condition.probability} probability)`, 20, yPosition);
          yPosition += 8;
          const descLines = pdf.splitTextToSize(`  ${condition.description}`, 165);
          pdf.text(descLines, 25, yPosition);
          yPosition += descLines.length * 6 + 5;
        });
      }
      
      // Medical Disclaimer
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.text("MEDICAL DISCLAIMER:", 20, yPosition);
      yPosition += 8;
      const disclaimerLines = pdf.splitTextToSize(analysisResult.medicalDisclaimer, 170);
      pdf.text(disclaimerLines, 20, yPosition);
      
      // Save the PDF
      const fileName = `healthwhisper-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Report Generated",
        description: `Your medical report has been downloaded as ${fileName}`,
      });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your PDF report.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || !analysisResult}
      className="flex items-center gap-2"
      variant="outline"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? "Generating PDF..." : "Export Report"}
    </Button>
  );
}