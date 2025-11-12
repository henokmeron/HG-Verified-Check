import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AccountSummaryProps {
  user: any;
  stats?: {
    totalLookups: number;
    thisMonthLookups: number;
    totalSpent: number;
  };
}

export default function AccountSummary({ user, stats }: AccountSummaryProps) {
  const memberSince = user?.createdAt ? new Date(user.createdAt) : new Date();
  
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Credit Balance</span>
            <span className="font-semibold text-primary-600">{user.creditBalance || 0} Credits</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">This Month</span>
            <span className="font-semibold text-gray-900">{stats?.thisMonthLookups || 0} Lookups</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Lookups</span>
            <span className="font-semibold text-gray-900">{stats?.totalLookups || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Spent</span>
            <span className="font-semibold text-gray-900">£{(stats?.totalSpent || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Member Since</span>
            <span className="font-semibold text-gray-900">
              {memberSince.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-primary-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">View detailed analytics</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
