"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import { useEndpoints } from "@/lib/hooks/useEndpoints";
import StatusBadge from "@/components/StatusBadge";
import RunModal from "@/components/RunModal";
import type { Endpoint } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  t2i:        "bg-blue-50 text-blue-600",
  i2v:        "bg-purple-50 text-purple-600",
  video_i2v:  "bg-purple-50 text-purple-600",
  keyframe:   "bg-indigo-50 text-indigo-600",
  extractor:  "bg-neutral-100 text-neutral-600",
  assembler:  "bg-neutral-100 text-neutral-600",
};

function EndpointCard({
  endpoint,
  onRun,
}: {
  endpoint: Endpoint;
  onRun: (endpoint: Endpoint) => void;
}) {
  const [promoting, setPromoting] = useState(false);

  const handleQuarantineAction = async (action: "test" | "approve" | "reject") => {
    setPromoting(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/quarantine-promote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action, endpoint_id: endpoint.id }),
        }
      );
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-geist-mono text-lg font-medium text-neutral-900 truncate">
              {endpoint.slug}
            </p>
            <span className="text-[10px] font-geist-mono bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
              v{endpoint.version}
            </span>
            <span
              className={`text-[10px] font-geist-mono px-2 py-0.5 rounded-full ${
                CATEGORY_COLORS[endpoint.category] ?? "bg-neutral-100 text-neutral-600"
              }`}
            >
              {endpoint.category}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">{endpoint.name}</p>
        </div>
        <StatusBadge status={endpoint.status} />
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-4 text-xs font-geist-mono text-neutral-500">
        <span>Pool: {endpoint.worker_pool}</span>
        <span>VRAM: {endpoint.min_vram_gb}GB</span>
        <span>{endpoint.required_models.length} models</span>
        <span>{endpoint.required_node_packs.length} packs</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        {endpoint.status === "approved" && (
          <button
            onClick={() => onRun(endpoint)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-all active:scale-[0.98]"
          >
            <Icon icon="solar:play-circle-linear" width={14} />
            Run
          </button>
        )}
        {endpoint.status === "quarantine" && (
          <>
            <button
              onClick={() => handleQuarantineAction("test")}
              disabled={promoting}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-medium hover:bg-amber-100 transition-all active:scale-[0.98]"
            >
              <Icon icon="solar:test-tube-linear" width={14} />
              Test
            </button>
            <button
              onClick={() => handleQuarantineAction("approve")}
              disabled={promoting}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-all active:scale-[0.98]"
            >
              <Icon icon="solar:shield-check-linear" width={14} />
              Approve
            </button>
            <button
              onClick={() => handleQuarantineAction("reject")}
              disabled={promoting}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium hover:bg-red-100 transition-all active:scale-[0.98]"
            >
              <Icon icon="solar:shield-cross-linear" width={14} />
              Reject
            </button>
          </>
        )}
        {(endpoint.status === "draft" || endpoint.status === "deprecated") && (
          <span className="text-xs text-neutral-400 font-geist-mono py-2">
            No actions available
          </span>
        )}
      </div>
    </div>
  );
}

export default function EndpointsPage() {
  const { endpoints, loading } = useEndpoints();
  const [runTarget, setRunTarget] = useState<Endpoint | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className={`max-w-4xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Endpoints</h1>
        <p className="text-sm text-neutral-500 font-geist-mono mt-1">
          Deployed workflow API endpoints
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : endpoints.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl p-12 text-center">
          <p className="text-sm text-neutral-400 font-geist-mono">
            No endpoints deployed yet. Import a workflow to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endpoints.map((ep, i) => (
            <div
              key={ep.id}
              className="opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <EndpointCard endpoint={ep} onRun={setRunTarget} />
            </div>
          ))}
        </div>
      )}

      {runTarget && (
        <RunModal endpoint={runTarget} onClose={() => setRunTarget(null)} />
      )}
    </div>
  );
}
