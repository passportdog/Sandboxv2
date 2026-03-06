"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { usePods } from "@/lib/hooks/usePods";
import StatusBadge from "@/components/StatusBadge";
import BootSequence from "@/components/BootSequence";
import type { PodInstance } from "@/lib/types";

const BOOT_STATUSES = ["creating", "booting", "restoring", "restarting"];

function getBootStep(status: string): number {
  if (status === "creating") return 0;
  if (status === "booting") return 1;
  if (status === "restoring") return 2;
  return -1;
}

function heartbeatFreshness(ts: string | null) {
  if (!ts) return { color: "text-neutral-400", label: "Never" };
  const age = Date.now() - new Date(ts).getTime();
  if (age < 60000) return { color: "text-emerald-500", label: `${Math.floor(age / 1000)}s ago` };
  if (age < 300000) return { color: "text-amber-500", label: `${Math.floor(age / 60000)}m ago` };
  return { color: "text-red-500", label: `${Math.floor(age / 60000)}m ago` };
}

function PodCard({ pod }: { pod: PodInstance }) {
  const isBooting = BOOT_STATUSES.includes(pod.status);
  const freshness = heartbeatFreshness(pod.last_heartbeat);
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    if (pod.comfyui_url) {
      navigator.clipboard.writeText(pod.comfyui_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const callEdge = async (fn: string, body: Record<string, unknown>) => {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-geist-mono text-sm font-medium text-neutral-900 truncate">
              {pod.runpod_pod_id}
            </p>
            {/* Template type */}
            <span
              className={`text-[10px] font-geist-mono px-2 py-0.5 rounded-full border ${
                pod.template_type === "quarantine"
                  ? "border-amber-300 text-amber-600"
                  : "bg-neutral-900 text-white border-neutral-900"
              }`}
            >
              {pod.template_type.toUpperCase()}
            </span>
            {/* Pool */}
            <span className="text-[10px] font-geist-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {pod.pool}
            </span>
          </div>
          <p className="font-geist-mono text-xs text-neutral-500 mt-0.5">
            {pod.gpu_type} · {pod.vram_gb}GB
          </p>
        </div>
        <StatusBadge status={pod.status} />
      </div>

      {/* Boot sequence animation */}
      {isBooting && (
        <div className="flex justify-center py-2">
          <BootSequence currentStep={getBootStep(pod.status)} />
        </div>
      )}

      {/* Ready/busy state */}
      {["ready", "idle"].includes(pod.status) && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-geist-mono text-xs text-emerald-700">Ready</span>
        </div>
      )}
      {pod.status === "busy" && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-geist-mono text-xs text-emerald-700">Running</span>
          {pod.current_run_id && (
            <a
              href="/runs"
              className="font-geist-mono text-[10px] text-neutral-400 hover:text-neutral-700 transition-colors ml-1"
            >
              {pod.current_run_id.slice(0, 12)}...
            </a>
          )}
        </div>
      )}
      {pod.status === "error" && pod.error_message && (
        <p className="font-geist-mono text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">
          {pod.error_message}
        </p>
      )}

      {/* ComfyUI URL */}
      {pod.comfyui_url && (
        <div className="flex items-center gap-2">
          <span className="font-geist-mono text-[10px] text-neutral-400 truncate flex-1">
            {pod.comfyui_url}
          </span>
          <button
            onClick={copyUrl}
            className="text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
          >
            <Icon icon={copied ? "solar:check-linear" : "solar:copy-linear"} width={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-[10px] font-geist-mono text-neutral-400">
        <span>{pod.total_runs} runs</span>
        <span>{pod.total_gpu_seconds.toFixed(0)}s GPU</span>
        <span>${(pod.total_cost_cents / 100).toFixed(2)}</span>
        <span className={`ml-auto ${freshness.color}`}>♥ {freshness.label}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-100">
        <button
          onClick={() => callEdge("snapshot-runtime", { pod_id: pod.id })}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
          title="Take Snapshot"
        >
          <Icon icon="solar:camera-linear" width={14} />
          Snapshot
        </button>
      </div>
    </div>
  );
}

export default function PodsPage() {
  const { pods, loading } = usePods();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className={`max-w-4xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Pods</h1>
        <p className="text-sm text-neutral-500 font-geist-mono mt-1">
          GPU pod lifecycle — {pods.length} pod{pods.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : pods.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl p-12 text-center">
          <p className="text-sm text-neutral-400 font-geist-mono">No pods provisioned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pods.map((pod, i) => (
            <div
              key={pod.id}
              className="opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <PodCard pod={pod} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
