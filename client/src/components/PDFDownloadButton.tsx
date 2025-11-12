
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface PDFDownloadButtonProps {
  vehicleData: any;
  reportRaw?: any;
  className?: string;
  lookupId?: string;
}

export default function PDFDownloadButton({ vehicleData, reportRaw, className, lookupId }: PDFDownloadButtonProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const generatePDF = async () => {
    // Debug logging
    console.log('PDFDownloadButton generatePDF called:', {
      hasVehicleData: !!vehicleData,
      hasReportRaw: !!reportRaw,
      packageName: reportRaw?.RequestInformation?.PackageName,
      isComprehensive: vehicleData?.isComprehensive,
      isAuthenticated,
      userEmail: user?.email
    });
    
    // Validate that we have data
    if (!vehicleData || !vehicleData.registration) {
      toast({
        title: "No Data Available",
        description: "Vehicle data is not available for PDF generation",
        variant: "destructive",
      });
      return;
    }

    // Allow downloads for both authenticated and non-authenticated users
    // For authenticated users, email will be sent automatically
    // For non-authenticated users, only download will work
    let email: string | undefined = undefined;
    
    if (isAuthenticated && user?.email) {
      email = user.email;
      console.log('Authenticated user - email will be sent to:', email);
    } else {
      console.log('Non-authenticated user - PDF will download only (no email)');
      // Still allow download, just without email
    }

    setIsDownloading(true);
    
    try {
      console.log('Requesting PDF generation for:', vehicleData.registration);
      console.log('Email:', email);
      
      // Call the server API to generate PDF
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          registration: vehicleData.registration,
          email: email || undefined, // Only include email if available
          vehicleData: vehicleData,
          reportRaw: reportRaw, // Include the full VDGI response for comprehensive reports
          lookupId: lookupId || vehicleData?.lookupId || undefined // Pass lookupId to link PDF to lookup
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} ${errorText}`);
      }

      // Check if the response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        console.error('Unexpected content type:', contentType);
        const text = await response.text();
        console.error('Response body:', text);
        throw new Error('Server did not return a PDF');
      }

      // Get the PDF blob from response
      const blob = await response.blob();
      console.log('PDF blob received, size:', blob.size);
      
      // Check if blob is valid
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Create a download link with proper attributes to force download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `vehicle-report-${vehicleData.registration}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = filename;
      link.style.display = 'none'; // Hide the link
      
      // Force download by setting download attribute and clicking
      document.body.appendChild(link);
      
      // Use setTimeout to ensure the link is in the DOM before clicking
      setTimeout(() => {
        link.click();
        // Clean up after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      }, 10);

      toast({
        title: "PDF Downloaded",
        description: email 
          ? `PDF downloaded and email sent to ${email}`
          : "PDF downloaded successfully",
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        generatePDF();
      }}
      variant="outline"
      size="sm"
      disabled={isDownloading}
      className={`${className} text-gray-900 border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 flex items-center`}
    >
      <Download className="h-4 w-4 mr-2 text-gray-900" />
      <span className="text-gray-900 font-medium">
        {isDownloading ? 'Generating...' : 'Download PDF'}
      </span>
    </Button>
  );
}
