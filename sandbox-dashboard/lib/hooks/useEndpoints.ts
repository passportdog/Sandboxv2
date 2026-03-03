"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import type { Endpoint } from "../types";
import { useRealtime } from "./useRealtime";

export function useEndpoints() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEndpoints = useCallback(async () => {
    const { data } = await supabase
      .from("endpoints")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setEndpoints(data as Endpoint[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEndpoints(); }, [fetchEndpoints]);

  useRealtime({
    table: "endpoints",
    event: "UPDATE",
    onData: () => fetchEndpoints(),
  });

  return { endpoints, loading, refetch: fetchEndpoints };
}
