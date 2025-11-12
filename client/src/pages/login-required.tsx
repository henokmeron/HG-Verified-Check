import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogIn, Shield } from "lucide-react";

export default function LoginRequired() {
  const handleLogin = () => {
    // Redirect to login with return URL
    const returnPath = window.location.pathname;
    window.location.href = `/api/login?redirect=${returnPath}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Card className="max-w-md w-full mx-4 p-8 bg-white/95 backdrop-blur-lg shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Login Required
          </h1>
          
          <p className="text-gray-600 mb-8">
            Please log in to access the admin panel and manage your vehicle check service.
          </p>
          
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            data-testid="button-login"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Log In with Replit
          </Button>
          
          <p className="text-sm text-gray-500 mt-6">
            Once logged in, you'll have full access to admin features including user management, analytics, and transaction monitoring.
          </p>
        </div>
      </Card>
    </div>
  );
}