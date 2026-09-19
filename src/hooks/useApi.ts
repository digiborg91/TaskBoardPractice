import { useMemo } from "react";
import { useAuth } from "../lib/auth";
import { supabase, API_BASE } from "../lib/supabase";
import { ApiClient } from "../lib/api";

export function useApi() {
  const { session } = useAuth();
  return useMemo(() => {
    const client = new ApiClient(API_BASE, supabase);
    void session;
    return client;
  }, [session]);
}
