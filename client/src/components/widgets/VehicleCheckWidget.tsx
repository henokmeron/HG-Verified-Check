import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Info, Shield } from "lucide-react";

// Example widget component - self-contained with namespaced styles
export default function VehicleCheckWidget() {
  return (
    <Card 
      className="vehicle-check-widget"
      style={{
        background: 'linear-gradient(to bottom right, #ffffff, #f9fafb)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Vehicle Identity Check
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">VIN Verified</p>
              <p className="text-xs text-gray-600">Vehicle identification number matches Vehicle Data UK records</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Engine Number Check</p>
              <p className="text-xs text-gray-600">Engine details confirmed with manufacturer records</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Plate Changes</p>
              <p className="text-xs text-gray-600">No registration plate changes recorded</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}