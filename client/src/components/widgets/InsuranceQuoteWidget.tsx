import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Insurance Quote Widget - for potential partnerships
export default function InsuranceQuoteWidget() {
  return (
    <Card 
      className="insurance-quote-widget"
      style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="h-5 w-5" />
          Insurance Savings
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-green-300" />
            <div>
              <p className="text-2xl font-bold">Save up to £300</p>
              <p className="text-sm text-white/80">on your car insurance</p>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-sm mb-2">Compare quotes from:</p>
            <ul className="text-xs space-y-1 text-white/90">
              <li>• Over 100 insurance providers</li>
              <li>• Instant online quotes</li>
              <li>• No impact on credit score</li>
            </ul>
          </div>
          
          <Button 
            className="w-full bg-white text-pink-700 hover:bg-gray-100"
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Get Quotes Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}