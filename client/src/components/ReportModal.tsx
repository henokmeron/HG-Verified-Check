import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedReportDisplay from './UnifiedReportDisplay';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleData: any;
  reportRaw: any;
  isPremium: boolean;
  lookupId?: string;
  registration?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  vehicleData,
  reportRaw,
  isPremium,
  lookupId,
  registration
}: ReportModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!lookupId) return;
    
    try {
      // Check if PDF exists for this lookup
      const pdfResponse = await fetch(`/api/lookup/${lookupId}/pdf`, {
        credentials: 'include'
      });
      
      if (pdfResponse.ok) {
        const pdfData = await pdfResponse.json();
        // Download the PDF using the downloadUrl
        if (pdfData.downloadUrl) {
          window.open(pdfData.downloadUrl, '_blank');
        } else {
          // If no saved PDF, generate a new one
          await generateNewPDF();
        }
      } else {
        // If no saved PDF, generate a new one
        await generateNewPDF();
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // Fallback: generate a new PDF
      await generateNewPDF();
    }
  };

  const generateNewPDF = async () => {
    try {
      // Generate PDF with lookupId
      const pdfResponse = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          registration: registration || vehicleData?.registration,
          vehicleData: vehicleData,
          reportRaw: reportRaw,
          lookupId: lookupId
        }),
      });

      if (pdfResponse.ok && pdfResponse.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HG-Verified-Report-${registration || vehicleData?.registration || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Vehicle Report {registration && `- ${registration}`}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="inline-flex"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="inline-flex"
                  disabled={!lookupId}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <UnifiedReportDisplay
                vehicleData={vehicleData}
                reportRaw={reportRaw}
                isPremium={isPremium}
                lookupId={lookupId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
}