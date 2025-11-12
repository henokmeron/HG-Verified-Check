import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

// Vehicle Recall Check Widget
export default function RecallCheckWidget() {
  const recalls = [
    { 
      id: 1, 
      status: 'resolved', 
      title: 'Airbag System Update',
      date: '2022-03-15',
      description: 'Software update for airbag deployment system'
    },
    { 
      id: 2, 
      status: 'pending', 
      title: 'Brake Fluid Check',
      date: '2023-09-20',
      description: 'Inspection required for brake fluid reservoir'
    }
  ];

  return (
    <Card 
      className="recall-check-widget"
      style={{
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Manufacturer Recalls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recalls.length > 0 ? (
            <>
              {recalls.map((recall) => (
                <div 
                  key={recall.id}
                  className="bg-white/80 rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {recall.status === 'resolved' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Info className="h-4 w-4 text-orange-600" />
                        )}
                        <p className="text-sm font-medium text-gray-800">
                          {recall.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {recall.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Date: {new Date(recall.date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      recall.status === 'resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {recall.status === 'resolved' ? 'Resolved' : 'Action Required'}
                    </span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-700 italic">
                {recalls.filter(r => r.status === 'pending').length} recall(s) require attention
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">No Active Recalls</p>
              <p className="text-xs text-gray-600">This vehicle has no outstanding recalls</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}