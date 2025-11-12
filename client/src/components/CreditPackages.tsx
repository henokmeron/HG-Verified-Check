import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";

const packages = [
  {
    id: 'basic',
    name: '1 Full Check',
    price: 7.00,
    pricePerCredit: '£7.00 per check',
    popular: false,
  },
  {
    id: 'starter',
    name: '5 Full Checks',
    price: 33.00,
    pricePerCredit: '£6.60 per check',
    popular: false,
  },
  {
    id: 'popular',
    name: '15 Full Checks',
    price: 87.00,
    pricePerCredit: '£5.80 per check',
    popular: true,
    badge: 'Most Popular',
    badgeColor: 'text-primary-600',
  },
  {
    id: 'business',
    name: '50 Full Checks',
    price: 265.00,
    pricePerCredit: '£5.30 per check',
    popular: false,
    badge: 'Best Value',
    badgeColor: 'text-green-600',
  },
];

export default function CreditPackages() {
  const [, navigate] = useLocation();
  const scrollAnimation = useScrollAnimation(0.2);

  const handlePurchase = (packageId: string) => {
    navigate(`/checkout?package=${packageId}`);
  };

  return (
    <motion.div
      ref={scrollAnimation.ref}
      initial={{ opacity: 0, y: 30 }}
      animate={scrollAnimation.isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Buy Credits</h3>
        
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 hover:rotate-1 ${
                pkg.popular 
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-primary-200' 
                  : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-primary-50'
              }`}
              onClick={() => handlePurchase(pkg.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900 mb-1">{pkg.name}</p>
                  {pkg.badge && (
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full bg-primary-100 border ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                  )}
                  <p className="text-sm font-medium text-gray-600 mt-2">{pkg.pricePerCredit}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">£{pkg.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Price</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 btn-no-cutoff whitespace-nowrap min-h-[48px]"
          onClick={() => handlePurchase('popular')}
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Purchase Credits Now
        </Button>
      </CardContent>
    </Card>
    </motion.div>
  );
}
