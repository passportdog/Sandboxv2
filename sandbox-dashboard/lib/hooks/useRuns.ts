"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import type { Run, RunEvent } from "../types";
import { useRealtime } from "./useRealtime";

export function useRuns() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    const { data } = await supabase
      .from("runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setRuns(data as Run[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  useRealtime({
    table: "runs",
    event: "UPDATE",
    onData: () => fetchRuns(),
  });

  useRealtime({
    table: "runs",
    event: "INSERT",
    onData: () => fetchRuns(),
  });

  const activeRuns = runs.filter((r) => ["pending", "submitted", "executing", "uploading"].includes(r.status));
  const completedRuns = runs.filter((r) => !["pending", "submitted", "executing", "uploading"].includes(r.status));

  return { runs, activeRuns, completedRuns, loading, refetch: fetchRuns };
}

export function useRunEvents(runId: string) {
  const [events, setEvents] = useState<RunEvent[]>([]);

  useEffect(() => {
    supabase
      .from("run_events")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setEvents(data as RunEvent[]);
      });
  }, [runId]);

  useRealtime({
    table: "run_events",
    event: "INSERT",
    filter: `run_id=eq.${runId}`,
    onData: (payload) => {
      const newEvent = (payload as { new: RunEvent }).new;
      if (newEvent) setEvents((prev) => [...prev, newEvent]);
    },
  });

  return events;
}
