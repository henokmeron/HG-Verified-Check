import { Mail, MessageCircle, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";

export default function Support() {
  const [, navigate] = useLocation();

  const faqs = [
    {
      question: "How much does each vehicle lookup cost?",
      answer: "Each comprehensive vehicle check costs £7.00. We offer bulk packages with significant savings: Starter (5 checks) - £6.60 per check, Standard (10 checks) - £6.20 per check, Popular (15 checks) - £5.80 per check, Business (50 checks) - £5.30 per check."
    },
    {
      question: "How long do credits last?",
      answer: "Credit validity depends on your package: Starter (30 days), Popular (90 days), Business (6 months). You can check your credit expiry in your dashboard."
    },
    {
      question: "What data do you provide?",
      answer: "We provide comprehensive Vehicle Data UK including make, model, year, engine size, fuel type, color, MOT status and expiry, tax status and expiry, CO2 emissions, Euro status, and more."
    },
    {
      question: "Is the data real-time?",
      answer: "Yes, our data is sourced directly from official Vehicle Data UK records and updated regularly to ensure accuracy and currency."
    },
    {
      question: "Can I get a refund?",
      answer: "Unused credits can be refunded within 30 days of purchase. Credits that have been used for successful lookups are not refundable."
    }
  ];

  const handleReturnToDashboard = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Return to Dashboard Button */}
      <div className="mb-10 flex flex-wrap gap-4 justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleReturnToDashboard}
          className="bg-white/95 backdrop-blur-lg shadow-lg border border-white/20 px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold btn-no-cutoff"
          data-testid="return-to-dashboard"
        >
          <span>← Return to Home</span>
        </Button>
        <Button
          type="button"
          onClick={() => navigate('/pricing')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 btn-no-cutoff"
        >
          View Premium Packages
        </Button>
      </div>

      <div className="text-center mb-16">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12">
          <h1 className="text-5xl font-black text-gray-900 mb-6" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Support Center</h1>
          <p className="text-2xl text-gray-700">Professional Support for HG Verified Vehicle Check</p>
        </div>
      </div>

      {/* Premium Packages Promotion */}
      <div className="mb-16">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl border border-blue-400/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">🚀 Upgrade to Premium Vehicle Checks</h2>
            <p className="text-blue-100 mb-6 text-lg">Get comprehensive vehicle history reports with detailed MOT records, specifications, and market valuations.</p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">£7.00</div>
                <div className="text-blue-100">Full History Check</div>
                <div className="text-sm text-blue-200">Complete MOT + detailed specs</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">£33-£265</div>
                <div className="text-blue-100">Credit Packages</div>
                <div className="text-sm text-blue-200">Save up to £47 vs competitors</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-blue-100">Instant Access</div>
                <div className="text-sm text-blue-200">Professional support included</div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/pricing')}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 btn-no-cutoff"
            >
              View All Premium Packages
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 mb-16">
        {/* Contact Options */}
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-2">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Email Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg text-gray-600 mb-6">
              Get professional help via email. We typically respond within 24 hours.
            </p>
            <Button 
              type="button" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold"
              onClick={() => window.location.href = 'mailto:support@hgverified.com'}
            >
              Email Us
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-2">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Live Chat</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg text-gray-600 mb-6">
              Chat with our support team Monday-Friday, 9AM-5PM GMT.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full font-semibold border-2"
              onClick={() => {
                // Placeholder for chat integration
                alert('Live chat coming soon! Please email us for now.');
              }}
            >
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Documentation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-lg text-gray-600 mb-6">
              Browse our comprehensive guides and API documentation.
            </p>
            <Link href="/api-docs">
              <Button 
                type="button"
                variant="outline" 
                className="w-full font-semibold border-2"
              >
                View Docs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-8">
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Frequently Asked Questions</h2>
          </div>
        </div>
        <div className="space-y-6 max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-white/95 backdrop-blur-lg shadow-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-1">
                    <HelpCircle className="h-5 w-5 text-white flex-shrink-0" />
                  </div>
                  <span className="font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>{faq.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 pl-8 leading-relaxed">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-xl text-gray-600 mb-8">
              Can't find what you're looking for? Fill out the form below and we'll get back to you as soon as possible.
            </p>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = (formData.get('name') as string) || '';
              const email = (formData.get('email') as string) || '';
              const phone = (formData.get('phone') as string) || 'Not provided';
              const subject = (formData.get('subject') as string) || 'Support Request';
              const message = (formData.get('message') as string) || '';
              
              // Validate required fields
              if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
                alert('Please fill in all required fields.');
                return;
              }
              
              const emailSubject = encodeURIComponent(subject);
              const emailBody = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
              );
              window.location.href = `mailto:support@hgverified.com?subject=${emailSubject}&body=${emailBody}`;
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+44 7XXX XXX XXX (Optional)"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your inquiry"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
              </div>
              <div className="text-center">
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}