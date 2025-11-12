import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, History, User, ArrowLeft, Download, Settings, Key, FileText, Trash2, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";

export default function AccountSettings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFirstName, setTempFirstName] = useState(user?.firstName || "");
  const [tempLastName, setTempLastName] = useState(user?.lastName || "");

  const { data: creditTransactions = [] } = useQuery<any[]>({
    queryKey: ["/api/credit-transactions"],
    enabled: !!user,
  });

  const { data: vehicleLookups = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicle-lookups"],
    enabled: !!user,
  });
  
  const { data: savedReportsResponse } = useQuery<any>({
    queryKey: ["/api/reports/list"],
    enabled: !!user,
  });

  const savedReports = savedReportsResponse?.reports || [];

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login?redirect=/app/account";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setTempFirstName(user?.firstName || "");
    setTempLastName(user?.lastName || "");
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
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

  const exportHistory = (type: 'lookups' | 'payments') => {
    const data = type === 'lookups' ? vehicleLookups : creditTransactions;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast({
        title: "No Data",
        description: `No ${type} history available to export`,
        variant: "destructive",
      });
      return;
    }

    let csvData;
    let filename;

    if (type === 'lookups') {
      csvData = data.map((lookup: any) => ({
        Date: new Date(lookup.createdAt).toLocaleDateString(),
        Registration: lookup.registration,
        Make: lookup.vehicleData?.make || 'N/A',
        Model: lookup.vehicleData?.model || 'N/A',
        Year: lookup.vehicleData?.year || 'N/A',
        Credits: lookup.creditsCost || 0,
        Status: lookup.success ? 'Success' : 'Failed'
      }));
      filename = 'vehicle-lookup-history.csv';
    } else {
      csvData = data.map((tx: any) => ({
        Date: new Date(tx.createdAt).toLocaleDateString(),
        Type: tx.type,
        Amount: tx.amount,
        Description: tx.description,
        'Stripe ID': tx.stripePaymentIntentId || 'N/A'
      }));
      filename = 'payment-history.csv';
    }

    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: `No ${type} history available to export`,
        variant: "destructive",
      });
      return;
    }

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row: any) => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Your ${type} history has been downloaded as CSV`,
    });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      return apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const passwordResetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/password-reset");
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      firstName: tempFirstName.trim(),
      lastName: tempLastName.trim()
    });
    setFirstName(tempFirstName.trim());
    setLastName(tempLastName.trim());
    setIsEditingName(false);
  };
  
  const handleCancelEdit = () => {
    setTempFirstName(firstName);
    setTempLastName(lastName);
    setIsEditingName(false);
  };
  
  const handleStartEdit = () => {
    setTempFirstName(firstName);
    setTempLastName(lastName);
    setIsEditingName(true);
  };

  const downloadMyHistory = async () => {
    try {
      const response = await fetch('/api/profile/history/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: "Your history has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download your history",
        variant: "destructive"
      });
    }
  };

  const downloadPaymentHistory = async () => {
    try {
      const response = await fetch('/api/profile/payments/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: "Your payment history has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download payment history",
        variant: "destructive"
      });
    }
  };

  const requestDataDeletion = async () => {
    try {
      await apiRequest("POST", "/api/profile/delete-request");
      toast({
        title: "Deletion Request Submitted",
        description: "Your data deletion request has been submitted. We'll contact you within 30 days."
      });
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-4 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-slate-600 mt-1 font-medium">Manage your account and view your history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary-600" />
                  <span>Account Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : 'Not set'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credit Balance</span>
                  <Badge variant="secondary" className="font-bold">
                    {user.creditBalance || 0} credits
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                      month: 'long',
                      year: 'numeric'
                    }) : 'Unknown'}
                  </span>
                </div>

                <div className="pt-4 space-y-3">
                  {isEditingName ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">First Name</label>
                        <Input
                          type="text"
                          placeholder="First Name"
                          value={tempFirstName}
                          onChange={(e) => setTempFirstName(e.target.value)}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600">Last Name</label>
                        <Input
                          type="text"
                          placeholder="Last Name"
                          value={tempLastName}
                          onChange={(e) => setTempLastName(e.target.value)}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600">First Name</span>
                          <p className="font-medium">{firstName || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-600">Last Name</span>
                          <p className="font-medium">{lastName || 'Not set'}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleStartEdit}
                        className="w-full"
                        variant="outline"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Name
                      </Button>
                    </div>
                  )}
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy More Credits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vehicle Lookup History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary-600" />
                  <span>Vehicle Lookup History</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportHistory('lookups')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {vehicleLookups && vehicleLookups.length > 0 ? (
                  <div className="space-y-3">
                    {vehicleLookups.slice(0, 10).map((lookup: any) => (
                      <div key={lookup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{lookup.registration}</div>
                          <div className="text-sm text-gray-600">
                            {lookup.vehicleData?.make} {lookup.vehicleData?.model} ({lookup.vehicleData?.year})
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(lookup.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={lookup.success ? "default" : "destructive"}>
                            {lookup.success ? "Success" : "Failed"}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {lookup.creditsCost} credit{lookup.creditsCost !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                    {vehicleLookups.length > 10 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={() => exportHistory('lookups')}>
                          View All {vehicleLookups.length} Lookups
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No vehicle lookups yet. Start by checking a vehicle!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Reports */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Save className="h-5 w-5 text-primary-600" />
                  <span>Saved Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedReports && savedReports.length > 0 ? (
                  <div className="space-y-3">
                    {savedReports.slice(0, 10).map((report: any) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{report.vrm}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {report.checkType} Report
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(report.createdAt)}</div>
                          <div className="text-xs text-gray-400">
                            {(report.bytes / 1024).toFixed(1)} KB • {report.fileName}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Download via the new download URL
                              window.open(report.downloadUrl, '_blank');
                              toast({
                                title: "Report Downloaded",
                                description: `${report.checkType} report for ${report.vrm} downloaded successfully`
                              });
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Saved Report?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the saved report for {report.vrm}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/saved-report/${report.id}`, {
                                        method: 'DELETE',
                                        credentials: 'include'
                                      });
                                      if (response.ok) {
                                        queryClient.invalidateQueries({ queryKey: ["/api/reports/list"] });
                                        toast({
                                          title: "Report Deleted",
                                          description: "The saved report has been deleted successfully"
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "Delete Failed",
                                        description: "Failed to delete the report",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                    {savedReports.length > 10 && (
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">Showing 10 of {savedReports.length} saved reports</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No saved reports yet. Reports are automatically saved when you generate them.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  <span>Payment History</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportHistory('payments')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {creditTransactions && creditTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {creditTransactions.slice(0, 10).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{transaction.type}</div>
                          <div className="text-sm text-gray-600">{transaction.description}</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                          </div>
                          {transaction.stripePaymentIntentId && (
                            <div className="text-xs text-gray-500">
                              Stripe: {transaction.stripePaymentIntentId.slice(-8)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {creditTransactions.length > 10 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={() => exportHistory('payments')}>
                          View All {creditTransactions.length} Transactions
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payment history yet. Purchase credits to get started!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Management & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={downloadMyHistory} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Vehicle Check History
              </Button>
              <Button variant="outline" onClick={downloadPaymentHistory} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Payment History
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Security Settings</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => passwordResetMutation.mutate()}
                  disabled={passwordResetMutation.isPending}
                  className="w-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {passwordResetMutation.isPending ? "Sending..." : "Reset Password"}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 text-red-600">GDPR Data Rights</h4>
              <p className="text-sm text-gray-600 mb-3">
                Under GDPR, you have the right to request deletion of your personal data.
                This will permanently remove your account and all associated data.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Request Data Deletion
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request Data Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will request the permanent deletion of your account and all associated data.
                      This action cannot be undone. We will contact you within 30 days to confirm this request.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={requestDataDeletion}>
                      Request Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        </main>
      </div>
    </AppLayout>
  );
}