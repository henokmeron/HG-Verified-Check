import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";

export default function FAQ() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about HG Verified Vehicle Check and our professional vehicle intelligence services
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {/* General Questions */}
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
          <CardContent className="p-10">
            <h2 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>General Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="what-is">
                <AccordionTrigger className="text-left">
                  What is HG Verified Vehicle Check?
                </AccordionTrigger>
                <AccordionContent>
                  HG Verified Vehicle Check is a comprehensive vehicle information service that provides instant access to official Vehicle Data UK records. 
                  We help buyers, sellers, and businesses make informed decisions by providing detailed vehicle history and specifications.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data-source">
                <AccordionTrigger className="text-left">
                  Where does your data come from?
                </AccordionTrigger>
                <AccordionContent>
                  Our data comes directly from official Vehicle Data UK records and is updated regularly to ensure accuracy. 
                  We are authorized to access and provide this information in compliance with all UK data protection regulations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-accurate">
                <AccordionTrigger className="text-left">
                  How accurate is the information?
                </AccordionTrigger>
                <AccordionContent>
                  Our information is extremely accurate as it comes directly from official government sources. 
                  The data includes MOT history, tax status, technical specifications, and more, all updated in real-time.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Pricing & Credits */}
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
          <CardContent className="p-10">
            <h2 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Pricing & Credits</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="cost">
                <AccordionTrigger className="text-left">
                  How much does each vehicle check cost?
                </AccordionTrigger>
                <AccordionContent>
                  Our pricing starts from £7.00 for a comprehensive vehicle check. We offer bulk packages with significant savings:
                  Starter (5 checks) - £6.60 per check (£33.00 total), Standard (10 checks) - £6.20 per check (£62.00 total), 
                  Popular (15 checks) - £5.80 per check (£87.00 total), Business (50 checks) - £5.30 per check (£265.00 total).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="credit-expiry">
                <AccordionTrigger className="text-left">
                  Do credits expire?
                </AccordionTrigger>
                <AccordionContent>
                  Credits have different validity periods depending on your package: 
                  Basic - 30 days, Starter - 90 days, Popular - 180 days, Business - 365 days.
                  We'll notify you before your credits expire.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refunds">
                <AccordionTrigger className="text-left">
                  Can I get a refund?
                </AccordionTrigger>
                <AccordionContent>
                  Unused credits can be refunded within 30 days of purchase. 
                  Credits that have been used for successful lookups are non-refundable. 
                  Please contact our support team for assistance with refunds.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>



        {/* Support */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Support & Contact</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="contact">
                <AccordionTrigger className="text-left">
                  How can I contact support?
                </AccordionTrigger>
                <AccordionContent>
                  You can reach our support team via email at support@hgverified.com. 
                  We typically respond within 24 hours during business days. 
                  For urgent matters, Business plan customers have access to priority support.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="business-hours">
                <AccordionTrigger className="text-left">
                  What are your support hours?
                </AccordionTrigger>
                <AccordionContent>
                  Our support team is available Monday to Friday, 9 AM to 5 PM GMT. 
                  We also monitor critical issues outside of business hours for Business plan customers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Contact CTA */}
      <section className="mt-16 text-center">
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-8">
            <MessageCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you with any questions about our vehicle check service
            </p>
            <a 
              href="mailto:support@hgverified.com"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </a>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}