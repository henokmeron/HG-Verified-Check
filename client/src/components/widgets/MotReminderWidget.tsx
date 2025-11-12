import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// MOT Reminder Widget - self-contained component
export default function MotReminderWidget() {
  const nextMotDate = new Date();
  nextMotDate.setMonth(nextMotDate.getMonth() + 3); // Example: 3 months from now

  return (
    <Card 
      className="mot-reminder-widget"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Calendar className="h-5 w-5" />
          MOT Reminder Service
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <div className="space-y-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Next MOT Due</span>
            </div>
            <p className="text-lg font-bold">
              {nextMotDate.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          <Button 
            className="w-full bg-white text-purple-700 hover:bg-gray-100"
            size="sm"
          >
            <Bell className="mr-2 h-4 w-4" />
            Set Reminder
          </Button>
          
          <p className="text-xs text-white/80">
            Never miss an MOT deadline. Get email reminders 30 days before your MOT expires.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}