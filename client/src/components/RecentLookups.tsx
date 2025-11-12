import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Eye, ArrowRight, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReportModal from "./ReportModal";

export default function RecentLookups() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: lookups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/vehicle-lookups"],
    staleTime: 30000, // 30 seconds
  });
  
  const handleViewReport = async (lookup: any) => {
    try {
      // Fetch the full report data
      const response = await fetch(`/api/vehicle-lookup/${lookup.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedReport({
          ...data,
          registration: lookup.registration,
          isPremium: lookup.isPremium
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  };

  const handleDownloadPDF = async (lookup: any) => {
    try {
      // Check if PDF exists for this lookup
      const pdfResponse = await fetch(`/api/lookup/${lookup.id}/pdf`, {
        credentials: 'include'
      });
      
      if (pdfResponse.ok) {
        const pdfData = await pdfResponse.json();
        // Download the PDF using the downloadUrl
        if (pdfData.downloadUrl) {
          window.open(pdfData.downloadUrl, '_blank');
        } else {
          // If no saved PDF, generate a new one
          await generateNewPDF(lookup);
        }
      } else {
        // If no saved PDF, generate a new one
        await generateNewPDF(lookup);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // Fallback: generate a new PDF
      await generateNewPDF(lookup);
    }
  };

  const generateNewPDF = async (lookup: any) => {
    try {
      // Fetch the full report data to generate PDF
      const response = await fetch(`/api/vehicle-lookup/${lookup.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Generate PDF with lookupId
        const pdfResponse = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            registration: lookup.registration,
            vehicleData: data.vehicleData,
            reportRaw: data.reportRaw,
            lookupId: lookup.id
          }),
        });

        if (pdfResponse.ok && pdfResponse.headers.get('content-type')?.includes('application/pdf')) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `HG-Verified-Report-${lookup.registration}-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lookups</h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-20" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lookups</h3>
        
        {!lookups || !Array.isArray(lookups) || lookups.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No vehicle lookups yet</p>
            <p className="text-sm text-gray-400 mt-1">Your lookup history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lookups.slice(0, 5).map((lookup: any) => (
              <div key={lookup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    lookup.success ? 'bg-primary-100' : 'bg-red-100'
                  }`}>
                    <Car className={`h-5 w-5 ${
                      lookup.success ? 'text-primary-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lookup.registration}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(lookup.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {lookup.success ? `${lookup.creditsCost} credit` : 'Failed'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    disabled={!lookup.success}
                    onClick={() => handleViewReport(lookup)}
                    title="View Report"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {lookup.success && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                      onClick={() => handleDownloadPDF(lookup)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {lookups && Array.isArray(lookups) && lookups.length > 5 && (
          <Button variant="ghost" className="mt-4 text-primary-600 hover:text-primary-700">
            View All History <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
      
      {/* Report Modal */}
      {selectedReport && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReport(null);
          }}
          vehicleData={selectedReport.vehicleData}
          reportRaw={selectedReport.reportRaw}
          isPremium={selectedReport.isPremium}
          lookupId={selectedReport.id}
          registration={selectedReport.registration}
        />
      )}
    </Card>
  );
}
