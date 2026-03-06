"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MetricCard from "@/components/MetricCard";
import Timeline, { eventToTimelineEntry } from "@/components/Timeline";
import type { RunEvent, Run, Endpoint, ModelRegistry } from "@/lib/types";
import { useRealtime } from "@/lib/hooks/useRealtime";

interface DashboardMetrics {
  endpointApproved: number;
  endpointTotal: number;
  activeRuns: number;
  costToday: number;
  modelsCached: number;
}

interface EnrichedRunEvent extends RunEvent {
  endpoint_slug?: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<EnrichedRunEvent[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadMetrics = async () => {
    const [endpointsRes, runsRes, modelsRes] = await Promise.all([
      supabase.from("endpoints").select("id, status"),
      supabase.from("runs").select("id, status, cost_cents, created_at"),
      supabase.from("models_registry").select("id", { count: "exact", head: true }),
    ]);

    const endpoints = (endpointsRes.data ?? []) as Endpoint[];
    const runs = (runsRes.data ?? []) as Run[];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeStatuses = ["pending", "submitted", "executing", "uploading"];
    const todayCost = runs
      .filter((r) => new Date(r.created_at) >= today)
      .reduce((sum, r) => sum + (r.cost_cents ?? 0), 0);

    setMetrics({
      endpointApproved: endpoints.filter((e) => e.status === "approved").length,
      endpointTotal: endpoints.length,
      activeRuns: runs.filter((r) => activeStatuses.includes(r.status)).length,
      costToday: todayCost / 100,
      modelsCached: modelsRes.count ?? 0,
    });
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from("run_events")
      .select("*, runs(endpoint_slug)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setEvents(
        data.map((e: RunEvent & { runs?: { endpoint_slug: string } | null }) => ({
          ...e,
          endpoint_slug: e.runs?.endpoint_slug,
        }))
      );
    }
  };

  useEffect(() => {
    loadMetrics();
    loadEvents();
  }, []);

  useRealtime({ table: "runs", event: "UPDATE", onData: () => { loadMetrics(); loadEvents(); } });
  useRealtime({ table: "run_events", event: "INSERT", onData: () => loadEvents() });

  return (
    <div
      className={`max-w-4xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 font-geist-mono mt-1">System health at a glance</p>
      </div>

      {/* Metrics Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 mb-10 -mx-6 px-6 scrollbar-thin">
        <MetricCard
          label="Endpoints"
          value={metrics ? `${metrics.endpointApproved}/${metrics.endpointTotal}` : "—"}
          sub="approved / total"
          dotColor={metrics && metrics.endpointApproved > 0 ? "bg-emerald-500" : undefined}
          loading={!metrics}
        />
        <MetricCard
          label="Active Runs"
          value={metrics?.activeRuns ?? "—"}
          sub="currently executing"
          dotColor={metrics && metrics.activeRuns > 0 ? "bg-amber-400 animate-pulse" : undefined}
          loading={!metrics}
        />
        <MetricCard
          label="GPU Cost Today"
          value={metrics ? `$${metrics.costToday.toFixed(2)}` : "—"}
          sub="cumulative"
          loading={!metrics}
        />
        <MetricCard
          label="Models Cached"
          value={metrics?.modelsCached ?? "—"}
          sub="in registry"
          loading={!metrics}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium tracking-tight text-neutral-900 mb-6">
          Recent Activity
        </h2>
        {events.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center">
            <p className="text-sm text-neutral-400 font-geist-mono">No events yet. Start a run to see activity here.</p>
          </div>
        ) : (
          <Timeline entries={events.map(eventToTimelineEntry)} />
        )}
      </div>
    </div>
  );
}
