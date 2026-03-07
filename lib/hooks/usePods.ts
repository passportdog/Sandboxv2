"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import type { PodInstance } from "../types";
import { useRealtime } from "./useRealtime";

export function usePods() {
  const [pods, setPods] = useState<PodInstance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPods = useCallback(async () => {
    const { data } = await supabase
      .from("pod_instances")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPods(data as PodInstance[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPods(); }, [fetchPods]);

  useRealtime({
    table: "pod_instances",
    event: "UPDATE",
    onData: () => fetchPods(),
  });

  useRealtime({
    table: "pod_instances",
    event: "INSERT",
    onData: () => fetchPods(),
  });

  return { pods, loading, refetch: fetchPods };
}
