import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, ChevronLeft, ChevronRight, Download, CheckCircle, XCircle } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface VehicleLookup {
  id: string;
  userId: string;
  registration: string;
  vehicleData: any;
  creditsCost: number;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
  userEmail: string;
  userFirstName: string | null;
  userLastName: string | null;
}

interface LookupsResponse {
  lookups: VehicleLookup[];
  total: number;
}

export default function AdminLookups() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  const { data: lookupsData, isLoading: lookupsLoading } = useQuery<LookupsResponse>({
    queryKey: ["/api/admin/lookups", currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * limit;
      const response = await fetch(`/api/admin/lookups?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login?redirect=/admin/lookups";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading || lookupsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !lookupsData) {
    return null;
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

  const exportLookups = () => {
    if (!lookupsData.lookups.length) {
      toast({
        title: "No Data",
        description: "No lookups available to export",
        variant: "destructive",
      });
      return;
    }

    const csvData = lookupsData.lookups.map((lookup) => ({
      Date: new Date(lookup.createdAt).toLocaleDateString(),
      'User Email': lookup.userEmail,
      'User Name': `${lookup.userFirstName || ''} ${lookup.userLastName || ''}`.trim(),
      Registration: lookup.registration,
      Make: lookup.vehicleData?.make || 'N/A',
      Model: lookup.vehicleData?.model || 'N/A',
      Year: lookup.vehicleData?.year || 'N/A',
      'Credits Cost': lookup.creditsCost,
      Status: lookup.success ? 'Success' : 'Failed',
      'Error Message': lookup.errorMessage || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vehicle-lookups-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Vehicle lookup data has been exported to CSV",
    });
  };

  const totalPages = Math.ceil(lookupsData.total / limit);
  const successfulLookups = lookupsData.lookups.filter(l => l.success).length;
  const failedLookups = lookupsData.lookups.filter(l => !l.success).length;
  const totalCreditsUsed = lookupsData.lookups.reduce((sum, l) => sum + l.creditsCost, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="mb-2"
              data-testid="button-back-admin"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Car className="h-8 w-8 mr-3 text-primary-600" />
              Vehicle Lookup Management
            </h1>
            <p className="text-gray-600 mt-1">Monitor all customer vehicle searches and API usage</p>
          </div>
          <Button 
            onClick={exportLookups}
            className="bg-primary-600 hover:bg-primary-700"
            data-testid="button-export-lookups"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{successfulLookups}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{failedLookups}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalCreditsUsed}</div>
            <div className="text-sm text-gray-600">Credits Used</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-600">
              {successfulLookups > 0 ? ((successfulLookups / (successfulLookups + failedLookups)) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Lookups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vehicle Lookups ({lookupsData.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lookupsData.lookups.map((lookup) => (
                  <TableRow key={lookup.id}>
                    <TableCell className="text-sm">
                      {formatDate(lookup.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {lookup.userFirstName && lookup.userLastName 
                            ? `${lookup.userFirstName} ${lookup.userLastName}`
                            : lookup.userEmail?.split('@')[0] || 'Anonymous'
                          }
                        </div>
                        <div className="text-xs text-gray-500">{lookup.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {lookup.registration}
                    </TableCell>
                    <TableCell>
                      {lookup.vehicleData ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {lookup.vehicleData.make} {lookup.vehicleData.model}
                          </div>
                          <div className="text-gray-500">
                            {lookup.vehicleData.year}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {lookup.creditsCost}
                    </TableCell>
                    <TableCell>
                      <Badge className={lookup.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {lookup.success ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {lookup.success ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {lookup.errorMessage ? (
                        <span className="text-red-600 text-xs" title={lookup.errorMessage}>
                          {lookup.errorMessage.length > 30 
                            ? `${lookup.errorMessage.slice(0, 30)}...`
                            : lookup.errorMessage
                          }
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, lookupsData.total)} of {lookupsData.total} lookups
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}