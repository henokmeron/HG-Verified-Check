import logoUrl from "@/assets/car-check-logo.webp";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Car, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img 
                src={logoUrl} 
                alt="HG Verified Vehicle Check Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">HG Verified Vehicle Check</span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">Home</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">About</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 font-medium">Pricing</Link>
              <Link href="/support" className="text-gray-700 hover:text-primary-600 font-medium">Support</Link>
            </nav>

            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about HG Verified Vehicle Check services, pricing, and features.
          </p>
        </section>

        {/* FAQ Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-service">
                <AccordionTrigger className="text-left">What is HG Verified Vehicle Check?</AccordionTrigger>
                <AccordionContent>
                  HG Verified Vehicle Check is a professional vehicle data service that provides instant access to comprehensive 
                  DVLA vehicle information. We offer both free public lookups and premium credit-based services for 
                  unlimited access to vehicle history, MOT status, tax information, and more.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-credits-work">
                <AccordionTrigger className="text-left">How do credits work?</AccordionTrigger>
                <AccordionContent>
                  Credits are used for premium vehicle lookups. Each lookup costs 1 credit and provides comprehensive 
                  vehicle data including MOT history, tax status, and detailed specifications. You can purchase credit 
                  packages: 10 credits for £5, 50 credits for £20, or 100 credits for £30. Credits never expire.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-methods">
                <AccordionTrigger className="text-left">What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure 
                  Stripe payment system. All transactions are encrypted and PCI DSS compliant. Credits are added to 
                  your account instantly after successful payment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data-accuracy">
                <AccordionTrigger className="text-left">How accurate is the vehicle data?</AccordionTrigger>
                <AccordionContent>
                  All vehicle data comes directly from official DVLA databases, ensuring 100% accuracy and real-time 
                  updates. Our API is officially approved and we maintain direct connections with DVLA systems to 
                  provide the most current information available.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="free-vs-premium">
                <AccordionTrigger className="text-left">What's the difference between free and premium lookups?</AccordionTrigger>
                <AccordionContent>
                  Free public lookups provide basic vehicle information including make, model, year, fuel type, and 
                  current MOT/tax status. Premium credit-based lookups include additional details like MOT history, 
                  mileage records, previous owners, and comprehensive technical specifications.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="api-access">
                <AccordionTrigger className="text-left">Do you offer API access for businesses?</AccordionTrigger>
                <AccordionContent>
                  Yes! We provide RESTful API access for businesses and developers. Our API supports both free public 
                  lookups and authenticated premium lookups. Visit our API documentation page for detailed integration 
                  guides, rate limits, and pricing information.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data-privacy">
                <AccordionTrigger className="text-left">How do you protect my privacy?</AccordionTrigger>
                <AccordionContent>
                  We take privacy seriously. All searches are encrypted with SSL/TLS, we don't store your search 
                  history beyond transaction records, and we never share your data with third parties. We are fully 
                  GDPR compliant and follow strict data protection protocols.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support">
                <AccordionTrigger className="text-left">What if I need help or have issues?</AccordionTrigger>
                <AccordionContent>
                  Our support team is available 24/7 via email and live chat. We typically respond within 1 hour 
                  during business hours. For technical issues, billing questions, or general inquiries, visit our 
                  support page or contact us directly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refunds">
                <AccordionTrigger className="text-left">What is your refund policy?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day money-back guarantee on all credit purchases. If you're not satisfied with our 
                  service, contact our support team for a full refund. Refunds are processed within 5-10 business 
                  days to your original payment method.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-requirements">
                <AccordionTrigger className="text-left">What are the technical requirements?</AccordionTrigger>
                <AccordionContent>
                  VehicleCheck Pro works on any modern web browser (Chrome, Firefox, Safari, Edge) and all devices 
                  including desktop, tablet, and mobile. No software installation required. For API access, any 
                  programming language that supports HTTP requests can integrate with our service.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
            <p className="text-lg text-gray-700 mb-6">
              Our support team is here to help. Get in touch and we'll respond within the hour.
            </p>
            <Link href="/support">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}