import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show consent banner after a short delay
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
    // Enable analytics or other tracking here if needed
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowConsent(false);
    // Disable non-essential cookies
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-white shadow-lg border-2 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Cookie Settings</h3>
              <p className="text-gray-600 mb-4">
                We use essential cookies to make our site work and analytics cookies to understand how you interact 
                with our website. We never store or track personal vehicle search data. 
                <a href="/privacy" className="text-primary-600 hover:underline ml-1">
                  Learn more in our Privacy Policy
                </a>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAccept}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Accept All Cookies
                </Button>
                <Button 
                  onClick={handleReject}
                  variant="outline"
                  className="border-gray-300"
                >
                  Essential Only
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleReject}
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}