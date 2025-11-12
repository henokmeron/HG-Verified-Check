import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PoundSterling, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Vehicle Valuation Widget
export default function VehicleValuationWidget() {
  return (
    <Card 
      className="vehicle-valuation-widget"
      style={{
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: 'white'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5" />
          Vehicle Valuation
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-3">
              <PoundSterling className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/90">Market Value</p>
              <p className="text-2xl font-bold">£12,450</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/80">Trade Value:</span>
              <span className="font-medium">£10,900</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Private Sale:</span>
              <span className="font-medium">£12,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Dealer Retail:</span>
              <span className="font-medium">£13,995</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-white text-pink-700 hover:bg-gray-100"
            size="sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Get Full Valuation Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}