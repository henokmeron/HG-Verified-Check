import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export function useAuth() {
  const [forceStopLoading, setForceStopLoading] = useState(false);
  
  // Force stop loading after 3 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceStopLoading(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        try {
          const res = await fetch("/api/auth/user", {
            credentials: "include",
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          if (res.status === 401) {
            return null;
          }
          
          if (!res.ok) {
            return null;
          }
          
          return await res.json();
        } catch (err: any) {
          clearTimeout(timeoutId);
          // Network error or timeout - return null so app can still render
          if (err.name === 'AbortError' || err.message?.includes('fetch')) {
            console.warn('Auth check failed (backend may not be running), continuing as unauthenticated');
            return null;
          }
          throw err;
        }
      } catch (err) {
        // Any other error - return null so app can still render
        console.warn('Auth check error:', err);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    // Don't wait too long - if it takes more than 3 seconds, assume backend is down
    networkMode: 'offlineFirst',
  });

  // If loading takes too long, stop showing loading state so app can render
  // React Query will handle the timeout via the AbortController
  const shouldShowLoading = isLoading && !user && !error && !forceStopLoading;
  
  return {
    user: user ?? null,
    isLoading: shouldShowLoading,
    isAuthenticated: !!user,
    error,
  };
}
