import logoUrl from "@/assets/car-check-logo.webp";
import { Car, ArrowLeft, Mail, MessageCircle, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";

export default function Support() {
  const [, navigate] = useLocation();

  const faqs = [
    {
      question: "How much does each vehicle lookup cost?",
      answer: "Pricing varies by package: Starter (£0.50/lookup), Popular (£0.40/lookup), Business (£0.30/lookup). The more credits you buy, the better the price per lookup."
    },
    {
      question: "How long do credits last?",
      answer: "Credit validity depends on your package: Starter (30 days), Popular (90 days), Business (6 months). You can check your credit expiry in your dashboard."
    },
    {
      question: "What data do you provide?",
      answer: "We provide comprehensive DVLA data including make, model, year, engine size, fuel type, color, MOT status and expiry, tax status and expiry, CO2 emissions, Euro status, and more."
    },
    {
      question: "Is the data real-time?",
      answer: "Yes, our data is sourced directly from official DVLA records and updated regularly to ensure accuracy and currency."
    },
    {
      question: "Can I get a refund?",
      answer: "Unused credits can be refunded within 30 days of purchase. Credits that have been used for successful lookups are not refundable."
    },
    {
      question: "Do you offer API access?",
      answer: "Yes, API access is available for Business plan customers. Contact support to get your API key and integration documentation."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img 
                  src={logoUrl} 
                  alt="HG Verified Vehicle Check Logo" 
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold text-gray-900">HG Verified Vehicle Check</span>
              </Link>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600">Get help with HG Verified Vehicle Check</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary-600" />
                <span>Email Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get help via email. We typically respond within 24 hours.
              </p>
              <Button className="w-full">
                Email Us
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary-600" />
                <span>Live Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Chat with our support team Monday-Friday, 9AM-5PM GMT.
              </p>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <span>Documentation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Browse our comprehensive guides and API documentation.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/api-docs")}
              >
                View Docs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start space-x-2">
                    <HelpCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 pl-7">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-6">
                Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
              </p>
              <div className="text-center">
                <Button size="lg">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}