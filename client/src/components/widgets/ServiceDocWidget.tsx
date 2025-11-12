import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// Service Documentation Widget
export default function ServiceDocWidget() {
  return (
    <Card 
      className="service-doc-widget"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BookOpen className="h-5 w-5" />
          Service Documentation
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <div className="space-y-4">
          <p className="text-sm text-white/90">
            Learn how to get the most out of our vehicle check service
          </p>
          
          <div className="space-y-2">
            <Button 
              className="w-full bg-white/20 text-white hover:bg-white/30 justify-start"
              size="sm"
              variant="ghost"
            >
              <FileText className="mr-2 h-4 w-4" />
              Quick Start Guide
            </Button>
            
            <Button 
              className="w-full bg-white/20 text-white hover:bg-white/30 justify-start"
              size="sm"
              variant="ghost"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Sample Report
            </Button>
          </div>
          
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-xs font-medium mb-1">Need Help?</p>
            <p className="text-xs text-white/80">
              Visit our FAQ section or contact support for assistance
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}