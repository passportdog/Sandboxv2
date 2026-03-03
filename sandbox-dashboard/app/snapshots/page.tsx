"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import { usePods } from "@/lib/hooks/usePods";
import type { Snapshot, Endpoint } from "@/lib/types";

interface DiffResult {
  missing_packs: string[];
  wrong_version_packs: string[];
  extra_packs: string[];
  missing_models: string[];
  match: boolean;
}

function SnapshotDiffView({ diff }: { diff: DiffResult }) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-2">
        {diff.match ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-geist-mono text-xs text-emerald-700 uppercase tracking-widest">Match ✓</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-geist-mono text-xs text-amber-600 uppercase tracking-widest">Drift Detected ⚠</span>
          </>
        )}
      </div>

      {diff.missing_packs.length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-red-500 mb-1">
            Missing Packs
          </p>
          {diff.missing_packs.map((p) => (
            <div key={p} className="font-geist-mono text-xs text-red-600 flex items-center gap-1.5">
              <span>−</span> {p}
            </div>
          ))}
        </div>
      )}

      {diff.wrong_version_packs.length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-amber-500 mb-1">
            Wrong Version
          </p>
          {diff.wrong_version_packs.map((p) => (
            <div key={p} className="font-geist-mono text-xs text-amber-600 flex items-center gap-1.5">
              <span>~</span> {p}
            </div>
          ))}
        </div>
      )}

      {diff.extra_packs.length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
            Extra Packs
          </p>
          {diff.extra_packs.map((p) => (
            <div key={p} className="font-geist-mono text-xs text-neutral-500 flex items-center gap-1.5">
              <span>+</span> {p}
            </div>
          ))}
        </div>
      )}

      {diff.missing_models.length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-red-500 mb-1">
            Missing Models
          </p>
          {diff.missing_models.map((m) => (
            <div key={m} className="font-geist-mono text-xs text-red-600 flex items-center gap-1.5">
              <span>−</span> {m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SnapshotCard({
  snapshot,
  endpoints,
  pods,
}: {
  snapshot: Snapshot;
  endpoints: Endpoint[];
  pods: { id: string; runpod_pod_id: string }[];
}) {
  const [verifying, setVerifying] = useState(false);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [selectedPodId, setSelectedPodId] = useState("");
  const [restoring, setRestoring] = useState(false);

  const pinnedEndpoint = endpoints.find((e) => e.snapshot_id === snapshot.id);

  const handleVerify = async () => {
    if (!selectedPodId) return;
    setVerifying(true);
    setDiff(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/restore-snapshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            snapshot_id: snapshot.id,
            pod_id: selectedPodId,
            mode: "verify",
          }),
        }
      );
      const data = await res.json();
      setDiff(data);
    } finally {
      setVerifying(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedPodId) return;
    setRestoring(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/restore-snapshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            snapshot_id: snapshot.id,
            pod_id: selectedPodId,
            mode: "apply",
          }),
        }
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-900">{snapshot.name}</h3>
            {snapshot.is_locked && <span title="Locked">🔒</span>}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="font-geist-mono text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              ComfyUI {snapshot.comfyui_version}
            </span>
            <span className="font-geist-mono text-[10px] text-neutral-400">
              {snapshot.node_packs.length} packs · {snapshot.models.length} models
            </span>
          </div>
          {pinnedEndpoint && (
            <p className="font-geist-mono text-[10px] text-emerald-600 mt-1">
              Pinned → {pinnedEndpoint.slug}
            </p>
          )}
        </div>
        <span className="font-geist-mono text-[10px] text-neutral-400">
          {new Date(snapshot.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Pod selector + actions */}
      <div className="flex flex-col gap-3">
        <select
          value={selectedPodId}
          onChange={(e) => setSelectedPodId(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-geist-mono focus:outline-none focus:border-neutral-400 transition-colors"
        >
          <option value="">Select pod...</option>
          {pods.map((p) => (
            <option key={p.id} value={p.id}>{p.runpod_pod_id}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying || !selectedPodId}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-all disabled:opacity-40"
          >
            {verifying ? (
              <span className="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon icon="solar:check-square-linear" width={14} />
            )}
            Verify
          </button>
          <button
            onClick={handleRestore}
            disabled={restoring || !selectedPodId}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-all disabled:opacity-40"
          >
            {restoring ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon icon="solar:restart-linear" width={14} />
            )}
            Restore
          </button>
        </div>
      </div>

      {/* Diff result */}
      {diff && <SnapshotDiffView diff={diff} />}
    </div>
  );
}

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { pods } = usePods();

  const loadData = useCallback(async () => {
    const [snapRes, epRes] = await Promise.all([
      supabase.from("snapshots").select("*").order("created_at", { ascending: false }),
      supabase.from("endpoints").select("id, slug, snapshot_id"),
    ]);
    if (snapRes.data) setSnapshots(snapRes.data as Snapshot[]);
    if (epRes.data) setEndpoints(epRes.data as Endpoint[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  const podList = pods.map((p) => ({ id: p.id, runpod_pod_id: p.runpod_pod_id }));

  return (
    <div
      className={`max-w-4xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Snapshots</h1>
        <p className="text-sm text-neutral-500 font-geist-mono mt-1">Runtime state lockfiles</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-48 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : snapshots.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl p-12 text-center">
          <p className="text-sm text-neutral-400 font-geist-mono">
            No snapshots yet. Take one from the Pods page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snapshots.map((snap, i) => (
            <div
              key={snap.id}
              className="opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <SnapshotCard
                snapshot={snap}
                endpoints={endpoints}
                pods={podList}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
