import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, User, CreditCard, Search, Calendar, Mail, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserDetail {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  creditBalance: number;
  createdAt: string;
  stats?: {
    totalLookups: number;
  };
}

interface UserLookup {
  id: string;
  registration: string;
  checkType: 'basic' | 'premium';
  status: string;
  createdAt: string;
}

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: userDetail, isLoading } = useQuery<UserDetail>({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: !!user && !!userId,
  });

  const { data: userLookups } = useQuery<UserLookup[]>({
    queryKey: [`/api/admin/users/${userId}/lookups`],
    enabled: !!user && !!userId,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">User not found</p>
            <Button
              onClick={() => navigate("/admin/users")}
              className="mt-4"
            >
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/users")}
          className="mb-4"
          data-testid="button-back"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Users
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="h-8 w-8 mr-3 text-primary-600" />
              User Details
            </h1>
            <p className="text-gray-600 mt-1">View detailed information about this user</p>
          </div>
          <Badge variant={userDetail.role === 'admin' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
            {userDetail.role}
          </Badge>
        </div>
      </div>

      {/* User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </label>
                <p className="font-medium">{userDetail.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Name
                </label>
                <p className="font-medium">
                  {userDetail.firstName && userDetail.lastName 
                    ? `${userDetail.firstName} ${userDetail.lastName}`
                    : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  User ID
                </label>
                <p className="font-mono text-sm">{userDetail.id}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Credit Balance
                </label>
                <p className="text-2xl font-bold text-green-600">{userDetail.creditBalance || 0}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center">
                  <Search className="h-4 w-4 mr-1" />
                  Total Lookups
                </label>
                <p className="text-2xl font-bold">{userDetail.stats?.totalLookups || 0}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member Since
                </label>
                <p className="font-medium">{formatDate(userDetail.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Lookups */}
      {userLookups && userLookups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Vehicle Lookups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Registration</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userLookups.slice(0, 10).map((lookup) => (
                    <tr key={lookup.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-mono">{lookup.registration}</td>
                      <td className="py-2 px-4">
                        <Badge variant={lookup.checkType === 'premium' ? 'default' : 'secondary'}>
                          {lookup.checkType}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant={lookup.status === 'success' ? 'default' : 'destructive'}>
                          {lookup.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-600">
                        {formatDate(lookup.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}