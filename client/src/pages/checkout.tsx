import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

// Handle missing Stripe key gracefully
let stripePublicKey: string | undefined;
let stripePromise: ReturnType<typeof loadStripe> | null = null;

try {
  stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';
  console.log('🔑 Stripe Public Key:', stripePublicKey ? `${stripePublicKey.substring(0, 20)}...` : 'NOT SET');
  
  if (stripePublicKey !== 'pk_test_placeholder') {
    stripePromise = loadStripe(stripePublicKey, {
      // Enable Apple Pay and Google Pay
      stripeAccount: undefined, // Use your main account
    });
  }
  
  if (!stripePromise) {
    console.error('❌ Stripe not initialized - VITE_STRIPE_PUBLIC_KEY is missing or invalid');
  }
} catch (error) {
  console.error('❌ Error initializing Stripe:', error);
  stripePromise = null;
}

// Form validation schema
const checkoutFormSchema = z.object({
  cancellationWaiverConsent: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the digital content cancellation waiver to proceed"
  })
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const CheckoutForm = ({ package: selectedPackage, paymentIntentId }: { package: any, paymentIntentId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const [paymentElementError, setPaymentElementError] = useState<string | null>(null);
  
  // Initialize form with react-hook-form and zodResolver
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      cancellationWaiverConsent: false
    }
  });

  // Debug: Log Stripe and Elements status
  useEffect(() => {
    console.log('🔍 CheckoutForm Debug:', {
      hasStripe: !!stripe,
      hasElements: !!elements,
      isPaymentElementReady,
      paymentElementError
    });
  }, [stripe, elements, isPaymentElementReady, paymentElementError]);

  // Timeout to detect if PaymentElement never loads
  useEffect(() => {
    if (!isPaymentElementReady && !paymentElementError && stripe && elements) {
      const timeout = setTimeout(() => {
        console.error('⏱️ PaymentElement timeout - never called onReady');
        setPaymentElementError('Payment form failed to load. Please refresh the page and try again.');
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isPaymentElementReady, paymentElementError, stripe, elements]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check if PaymentElement is mounted
    const paymentElement = elements.getElement('payment');
    if (!paymentElement) {
      toast({
        title: "Payment Error",
        description: "Payment form is not ready. Please wait for the payment form to load completely.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Manually confirm payment with consent data
        try {
          const response = await apiRequest('POST', '/api/confirm-payment', {
            paymentIntentId: paymentIntent.id,
            cancellationWaiverConsent: values.cancellationWaiverConsent,
            consentTimestamp: new Date().toISOString(),
            packageDetails: {
              credits: selectedPackage.credits,
              price: selectedPackage.price
            }
          });
          const result = await response.json();
          
          if (result.success) {
            toast({
              title: "Payment Successful",
              description: result.message,
            });
            navigate("/app");
          } else {
            toast({
              title: "Payment Processed",
              description: "Payment succeeded but there was an issue adding credits. Please contact support.",
              variant: "destructive",
            });
          }
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          toast({
            title: "Payment Processed",
            description: "Payment succeeded but there was an issue adding credits. Please contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Purchase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{selectedPackage.credits} Credits</h3>
              <p className="text-sm text-gray-600">£{selectedPackage.pricePerCredit} per lookup</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">£{selectedPackage.price}</p>
              <p className="text-xs text-gray-500">Price inc. VAT</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              {!isPaymentElementReady && !paymentElementError && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading payment form...</p>
                  </div>
                </div>
              )}
              {paymentElementError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">Payment Form Error</p>
                  <p className="text-xs text-red-600 mt-1">{paymentElementError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setPaymentElementError(null);
                      setIsPaymentElementReady(false);
                      window.location.reload();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {stripe && elements ? (
                <PaymentElement 
                  options={{
                    layout: {
                      type: 'tabs',
                      defaultCollapsed: false,
                    },
                    wallets: {
                      applePay: 'auto',
                      googlePay: 'auto'
                    },
                    fields: {
                      billingDetails: {
                        name: 'auto',
                        email: 'auto'
                      }
                    }
                  }}
                  onReady={() => {
                    console.log('✅ PaymentElement is ready');
                    setIsPaymentElementReady(true);
                    setPaymentElementError(null);
                  }}
                  onError={(error) => {
                    console.error('❌ PaymentElement error:', error);
                    setPaymentElementError(error.message || 'Failed to load payment form');
                    setIsPaymentElementReady(false);
                  }}
                />
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">Waiting for Stripe to initialize...</p>
                  <p className="text-xs text-yellow-600 mt-1">Stripe: {stripe ? '✅' : '❌'}, Elements: {elements ? '✅' : '❌'}</p>
                </div>
              )}
            </div>
            
            {/* UK Digital Content Cancellation Waiver - Required by Law */}
            <FormField
              control={form.control}
              name="cancellationWaiverConsent"
              render={({ field }) => (
                <FormItem className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FormControl>
                      <Checkbox
                        data-testid="checkbox-waiver-consent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-700 font-normal cursor-pointer">
                        <strong>Digital Content Agreement (Required):</strong> I consent to immediate access to my digital 
                        vehicle reports and acknowledge I will <strong>lose the 14-day cancellation right</strong> once 
                        download/email delivery starts. Credits are non-refundable once used for vehicle lookups.
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-600">
                        Required by UK Consumer Contracts Regulations 2013 for digital content delivery
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              data-testid="button-pay"
              className="w-full" 
              disabled={!stripe || !isPaymentElementReady || isProcessing || !form.formState.isValid}
            >
              {isProcessing ? "Processing..." : `Pay £${selectedPackage.price}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Get package details from URL params or state - safely handle SSR
  const packageType = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('package')
    : null;
  
  const packages = {
    basic: { credits: 1, price: 7.00, pricePerCredit: '7.00' },
    mini: { credits: 3, price: 20.00, pricePerCredit: '6.67' },
    starter: { credits: 5, price: 33.00, pricePerCredit: '6.60' },
    standard: { credits: 10, price: 62.00, pricePerCredit: '6.20' },
    popular: { credits: 15, price: 87.00, pricePerCredit: '5.80' },
    business: { credits: 50, price: 265.00, pricePerCredit: '5.30' },
  };

  const selectedPackage = packages[packageType as keyof typeof packages];

  useEffect(() => {
    if (!selectedPackage) {
      toast({
        title: "Invalid Package",
        description: "Please select a valid credit package.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Only create payment intent if authenticated and we don't already have one and not already creating
    if (isAuthenticated && !clientSecret && !isCreatingPayment && !isLoading) {
      setIsCreatingPayment(true);
      console.log('💳 Starting payment intent creation...', { 
        package: selectedPackage, 
        isAuthenticated, 
        isLoading 
      });
      
      // Create PaymentIntent as soon as the page loads with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Payment initialization timed out after 30 seconds')), 30000)
      );
      
      const paymentPromise = apiRequest("POST", "/api/create-payment-intent", { 
        amount: selectedPackage.price,
        credits: selectedPackage.credits,
        description: `${selectedPackage.credits} Credits Purchase`
      })
        .then(async (res) => {
          console.log('💳 Payment intent response received:', res.status);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: `Server error: ${res.status}` }));
            throw new Error(errorData.message || errorData.error || `Server error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('💳 Payment intent data:', { hasSecret: !!data.clientSecret, hasId: !!data.paymentIntentId });
          if (data.clientSecret && data.paymentIntentId) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId);
            console.log('✅ Payment intent created successfully');
          } else {
            throw new Error(data.message || "Invalid response from server");
          }
          setIsCreatingPayment(false);
        });
      
      Promise.race([paymentPromise, timeoutPromise])
        .catch((error) => {
          setIsCreatingPayment(false);
          console.error("❌ Payment initialization error:", error);
          console.error("Error details:", error);
          const errorMessage = error.message || error.toString() || "Unknown error";
          toast({
            title: "Payment Initialization Failed",
            description: errorMessage.includes("timed out")
              ? "The payment system is taking too long to respond. Please try again or contact support."
              : `Failed to initialize payment: ${errorMessage}. Please check the server console for details.`,
            variant: "destructive",
          });
        });
    }
  }, [selectedPackage, clientSecret, isCreatingPayment, isAuthenticated, isLoading]); // Added isAuthenticated and isLoading

  if (!selectedPackage) {
    return null;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-3xl p-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6" />
            <p className="text-2xl text-gray-700 font-semibold">Loading Payment System...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show signup prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="bg-white/95 backdrop-blur-lg shadow-lg border border-white/20 px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <Card className="max-w-md mx-auto text-center bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-3 mr-3">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-black" style={{ fontFamily: "'Segoe UI', 'Microsoft Sans Serif', sans-serif" }}>Sign Up Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{selectedPackage.credits} Credits</h3>
                    <p className="text-sm text-gray-600">£{selectedPackage.pricePerCredit} per lookup</p>
                  </div>
                  <p className="text-xl font-bold">£{selectedPackage.price}</p>
                </div>
              </div>

              <p className="text-gray-600">
                Premium Full Check — Sign up, then pay £{selectedPackage.price} for instant access to comprehensive UK vehicle data.
              </p>

              <p className="text-sm text-gray-500 italic">
                Create an account to purchase and access your report instantly.
              </p>

              <Button 
                onClick={() => {
                  if (packageType) {
                    localStorage.setItem('checkout_package', packageType);
                  }
                  window.location.href = `/api/login`;
                }}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign up to continue
              </Button>

              <p className="text-xs text-gray-500">
                Create an account • Pay £{selectedPackage.price} for full report • Instant results
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Preparing payment...</p>
          {isCreatingPayment && (
            <p className="text-sm text-gray-500 mt-2">Creating payment intent...</p>
          )}
        </div>
      </div>
    );
  }

  // Log clientSecret status for debugging
  useEffect(() => {
    console.log('💳 Checkout Page Debug:', {
      hasClientSecret: !!clientSecret,
      clientSecretLength: clientSecret?.length || 0,
      hasStripePromise: !!stripePromise,
      isAuthenticated,
      isLoading
    });
  }, [clientSecret, stripePromise, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/app")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Purchase Credits</h1>
          <p className="text-gray-600 text-center mt-2">Add credits to your account for vehicle lookups</p>
        </div>

        {stripePromise ? (
          <Elements 
            stripe={stripePromise} 
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0570de',
                  colorBackground: '#ffffff',
                  colorText: '#30313d',
                  colorDanger: '#df1b41',
                  spacingUnit: '6px',
                  borderRadius: '8px'
                }
              },
              loader: 'auto'
            }}
            key={clientSecret} // Force re-render when clientSecret changes
          >
            <CheckoutForm package={selectedPackage} paymentIntentId={paymentIntentId} />
          </Elements>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Payment System Unavailable</h3>
            <p className="text-yellow-700 mb-4">
              Stripe payment processing is not configured for development mode.
            </p>
            <p className="text-sm text-yellow-600">
              To enable payments, configure the VITE_STRIPE_PUBLIC_KEY environment variable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
