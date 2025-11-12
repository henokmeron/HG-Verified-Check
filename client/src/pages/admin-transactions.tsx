import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'deduction' | 'refund';
  amount: number;
  description: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
  userEmail: string;
  userFirstName: string | null;
  userLastName: string | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export default function AdminTransactions() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<TransactionsResponse>({
    queryKey: ["/api/admin/transactions", currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * limit;
      const response = await fetch(`/api/admin/transactions?limit=${limit}&offset=${offset}`);
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
        window.location.href = "/api/login?redirect=/admin/transactions";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading || transactionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !transactionsData) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(Math.abs(amount) * 7.0); // £7.00 per credit for single checks
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800';
      case 'deduction': return 'bg-red-100 text-red-800';
      case 'refund': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportTransactions = () => {
    if (!transactionsData.transactions.length) {
      toast({
        title: "No Data",
        description: "No transactions available to export",
        variant: "destructive",
      });
      return;
    }

    const csvData = transactionsData.transactions.map((tx) => ({
      Date: new Date(tx.createdAt).toLocaleDateString(),
      'User Email': tx.userEmail,
      'User Name': `${tx.userFirstName || ''} ${tx.userLastName || ''}`.trim(),
      Type: tx.type,
      'Credits Amount': tx.amount,
      'Currency Value': formatCurrency(tx.amount),
      Description: tx.description,
      'Stripe ID': tx.stripePaymentIntentId || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Transaction data has been exported to CSV",
    });
  };

  const totalPages = Math.ceil(transactionsData.total / limit);

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
              <CreditCard className="h-8 w-8 mr-3 text-primary-600" />
              Transaction Management
            </h1>
            <p className="text-gray-600 mt-1">Monitor all customer payments and credit transactions</p>
          </div>
          <Button 
            onClick={exportTransactions}
            className="bg-primary-600 hover:bg-primary-700"
            data-testid="button-export-transactions"
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
            <div className="text-2xl font-bold text-green-600">
              {transactionsData.transactions.filter(t => t.type === 'purchase').length}
            </div>
            <div className="text-sm text-gray-600">Purchases</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {transactionsData.transactions.filter(t => t.type === 'deduction').length}
            </div>
            <div className="text-sm text-gray-600">Deductions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {transactionsData.transactions.filter(t => t.type === 'refund').length}
            </div>
            <div className="text-sm text-gray-600">Refunds</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary-600">
              {formatCurrency(
                transactionsData.transactions
                  .filter(t => t.type === 'purchase')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({transactionsData.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Stripe ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsData.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {transaction.userFirstName && transaction.userLastName 
                            ? `${transaction.userFirstName} ${transaction.userLastName}`
                            : transaction.userEmail?.split('@')[0] || 'Anonymous'
                          }
                        </div>
                        <div className="text-xs text-gray-500">{transaction.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {transaction.stripePaymentIntentId ? (
                        <span title={transaction.stripePaymentIntentId}>
                          {transaction.stripePaymentIntentId.slice(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
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
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, transactionsData.total)} of {transactionsData.total} transactions
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