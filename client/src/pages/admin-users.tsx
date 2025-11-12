import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Settings, CreditCard, Shield, ChevronLeft, ChevronRight, Edit, Download, Plus, Minus } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  creditBalance: number;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalLookups: number;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
}

export default function AdminUsers() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchUser, setSearchUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "" });
  const [creditAmount, setCreditAmount] = useState("");
  const [creditAction, setCreditAction] = useState<"add" | "deduct">("add");
  const limit = 20;

  const { data: usersData, isLoading: usersLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users", currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * limit;
      const response = await fetch(`/api/admin/users?limit=${limit}&offset=${offset}`);
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

  const searchMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/admin/search/users?email=${encodeURIComponent(email)}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: (data: any) => {
      setSearchUser(data);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login?redirect=/admin/users";
        }, 500);
        return;
      }
      if (error.message.includes('404')) {
        toast({
          title: "User Not Found",
          description: "No user found with that email address.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search Failed",
          description: error.message || "Failed to search for user",
          variant: "destructive",
        });
      }
    },
  });

  // Customer update mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/customers/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer Updated",
        description: "Customer details updated successfully"
      });
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login?redirect=/admin/users";
        }, 500);
        return;
      }
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Credit adjustment mutation
  const adjustCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string, amount: number, reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/customers/${userId}/credits`, { amount, reason });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Credits Updated",
        description: `Credits ${creditAction === 'add' ? 'added' : 'deducted'} successfully. New balance: ${data.newBalance}`
      });
      setCreditAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login?redirect=/admin/users";
        }, 500);
        return;
      }
      toast({
        title: "Credit Adjustment Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Role change mutation
  const roleChangeMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'user' | 'admin' }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "User role updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login?redirect=/admin/users";
        }, 500);
        return;
      }
      toast({
        title: "Role Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login?redirect=/admin/users";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !usersData) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    searchMutation.mutate(searchEmail.trim());
  };

  const handleEditCustomer = (user: User) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || ""
    });
  };

  const handleUpdateCustomer = () => {
    if (!editingUser) return;
    updateCustomerMutation.mutate({
      userId: editingUser.id,
      data: editForm
    });
  };

  const handleAdjustCredits = (userId: string) => {
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount === 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid credit amount",
        variant: "destructive"
      });
      return;
    }

    const finalAmount = creditAction === "deduct" ? -amount : amount;
    const reason = `Admin ${creditAction} of ${amount} credits`;

    adjustCreditsMutation.mutate({
      userId,
      amount: finalAmount,
      reason
    });
  };

  const handleRoleChange = (userId: string, role: 'user' | 'admin') => {
    roleChangeMutation.mutate({ userId, role });
  };

  const downloadCustomerHistory = async (userId: string, email: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${userId}/history/csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-history-${email}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download customer history",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalPages = Math.ceil(usersData.total / limit);

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
              <Users className="h-8 w-8 mr-3 text-primary-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage customer accounts, roles, and credits</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Search by email address..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                data-testid="input-search-email"
              />
            </div>
            <Button
              type="submit"
              disabled={searchMutation.isPending}
              data-testid="button-search-user"
            >
              <Search className="h-4 w-4 mr-2" />
              {searchMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </form>

          {searchUser && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Search Result:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {searchUser.email}</p>
                <p><strong>Name:</strong> {searchUser.firstName} {searchUser.lastName}</p>
                <p><strong>Credits:</strong> {searchUser.creditBalance}</p>
                <p><strong>Role:</strong> <Badge variant={searchUser.role === 'admin' ? 'default' : 'secondary'}>{searchUser.role}</Badge></p>
                <p><strong>Joined:</strong> {formatDate(searchUser.createdAt)}</p>
              </div>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => navigate(`/admin/users/${searchUser.id}`)}
                data-testid="button-view-user-details"
              >
                View Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({usersData.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usersData.users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* User Info Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold truncate">{user.email}</h3>
                        <p className="text-sm text-gray-600">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Name not set'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCustomer(user)}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCustomerHistory(user.id, user.email)}
                          data-testid={`button-download-${user.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Credit Balance</p>
                        <p className="text-2xl font-bold text-green-600">{user.creditBalance || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vehicle Lookups</p>
                        <p className="text-2xl font-bold">{user.stats?.totalLookups || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="text-lg">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Credit Management */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(e.target.value)}
                          className="w-24 h-8"
                          data-testid={`input-credit-amount-${user.id}`}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCreditAction("add")}
                              data-testid={`button-add-credits-${user.id}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Add Credits</AlertDialogTitle>
                              <AlertDialogDescription>
                                Add {creditAmount} credits to {user.email}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAdjustCredits(user.id)}>
                                Add Credits
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCreditAction("deduct")}
                              data-testid={`button-deduct-credits-${user.id}`}
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Deduct
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deduct Credits</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deduct {creditAmount} credits from {user.email}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAdjustCredits(user.id)}>
                                Deduct Credits
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Role Management */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Role:</span>
                        <Select
                          value={user.role}
                          onValueChange={(value: 'user' | 'admin') => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-28" data-testid={`select-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* View Details */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        data-testid={`button-view-user-${user.id}`}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, usersData.total)} of {usersData.total} users
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

      {/* Customer Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <Input
                id="firstName"
                value={editForm.firstName}
                onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <Input
                id="lastName"
                value={editForm.lastName}
                onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCustomer} disabled={updateCustomerMutation.isPending}>
              {updateCustomerMutation.isPending ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}