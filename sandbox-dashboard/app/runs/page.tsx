"use client";

import { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import { useRuns } from "@/lib/hooks/useRuns";
import { useRunEvents } from "@/lib/hooks/useRuns";
import StatusBadge from "@/components/StatusBadge";
import type { Run, RunEvent, Artifact } from "@/lib/types";

function formatDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt) return "—";
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const secs = Math.floor((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function formatCost(cents: number | null) {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(4)}`;
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(formatDuration(startedAt, null));
  useEffect(() => {
    const t = setInterval(() => setElapsed(formatDuration(startedAt, null)), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  return <span className="font-geist-mono text-xs text-neutral-500">{elapsed}</span>;
}

function RunDetail({ run }: { run: Run }) {
  const events = useRunEvents(run.id);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  useEffect(() => {
    supabase
      .from("artifacts")
      .select("*")
      .eq("run_id", run.id)
      .then(({ data }) => { if (data) setArtifacts(data as Artifact[]); });
  }, [run.id]);

  return (
    <div className="px-4 pb-4 border-t border-neutral-100 mt-2 flex flex-col gap-4">
      {/* Events mini-timeline */}
      <div>
        <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-4 mb-3">
          Events
        </p>
        <div className="flex flex-col gap-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3">
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  ev.event_type === "succeeded" ? "bg-emerald-500"
                  : ev.event_type === "failed" ? "bg-red-500"
                  : "bg-neutral-300"
                }`}
              />
              <span className="font-geist-mono text-xs text-neutral-700">{ev.event_type.replace(/_/g, " ")}</span>
              <span className="font-geist-mono text-[10px] text-neutral-400 ml-auto">
                {new Date(ev.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Provenance */}
      {run.provenance && Object.keys(run.provenance).length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
            Provenance
          </p>
          <div className="bg-neutral-50 rounded-xl p-3 flex flex-col gap-1">
            {Object.entries(run.provenance).map(([k, v]) => (
              <div key={k} className="flex gap-2 text-xs font-geist-mono">
                <span className="text-neutral-500 shrink-0">{k}:</span>
                <span className="text-neutral-700 break-all">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      <div className="flex gap-4 text-xs font-geist-mono text-neutral-500">
        <span>GPU: {run.gpu_seconds != null ? `${run.gpu_seconds.toFixed(1)}s` : "—"}</span>
        <span>Cost: {formatCost(run.cost_cents)}</span>
        <span>Artifacts: {artifacts.length}</span>
      </div>

      {/* Artifacts */}
      {artifacts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {artifacts.map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="group">
              {a.content_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.thumbnail_url ?? a.url}
                  alt={a.filename}
                  className="w-full aspect-square object-cover rounded-xl border border-neutral-200 group-hover:border-neutral-400 transition-colors"
                />
              ) : (
                <div className="w-full aspect-square bg-neutral-100 rounded-xl flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                  <Icon icon="solar:video-frame-linear" width={24} className="text-neutral-400" />
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveRunCard({ run }: { run: Run }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-geist-mono text-xs text-neutral-900 font-medium truncate max-w-[200px]">
            {run.id.slice(0, 20)}...
          </p>
          <p className="font-geist-mono text-xs text-neutral-500 mt-0.5">{run.endpoint_slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={run.status} />
          {run.started_at && <ElapsedTimer startedAt={run.started_at} />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${run.progress ?? 0}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-geist-mono text-neutral-400">
        <span>{run.gpu_type ?? "GPU TBD"}</span>
        <span>{run.progress ?? 0}%</span>
      </div>

      <button
        className="w-full flex items-center justify-center gap-1.5 py-2 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
        onClick={async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("runs").update({ status: "cancelled" }).eq("id", run.id);
        }}
      >
        <Icon icon="solar:close-circle-linear" width={14} />
        Cancel
      </button>
    </div>
  );
}

export default function RunsPage() {
  const { activeRuns, completedRuns, loading } = useRuns();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className={`max-w-4xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Runs</h1>
        <p className="text-sm text-neutral-500 font-geist-mono mt-1">Execution monitoring</p>
      </div>

      {/* Active runs */}
      {activeRuns.length > 0 && (
        <div className="mb-10">
          <h2 className="text-base font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Active Runs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRuns.map((run) => (
              <ActiveRunCard key={run.id} run={run} />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-base font-medium text-neutral-900 mb-4">History</h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : completedRuns.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl p-12 text-center">
            <p className="text-sm text-neutral-400 font-geist-mono">No completed runs yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {completedRuns.map((run, i) => (
              <div
                key={run.id}
                className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all overflow-hidden opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <button
                  onClick={() => setExpanded(expanded === run.id ? null : run.id)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <StatusBadge status={run.status} />
                  <span className="font-geist-mono text-xs text-neutral-700">{run.endpoint_slug}</span>
                  <span className="font-geist-mono text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {run.caller}
                  </span>
                  <div className="flex gap-4 ml-auto text-[10px] font-geist-mono text-neutral-400">
                    <span>{formatDuration(run.started_at, run.completed_at)}</span>
                    <span>{formatCost(run.cost_cents)}</span>
                    <span>{new Date(run.created_at).toLocaleDateString()}</span>
                  </div>
                  <Icon
                    icon={expanded === run.id ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
                    width={16}
                    className="text-neutral-400 flex-shrink-0"
                  />
                </button>

                {expanded === run.id && <RunDetail run={run} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
