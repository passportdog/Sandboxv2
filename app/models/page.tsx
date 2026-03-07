"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import type { ModelRegistry } from "@/lib/types";

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1e6) return `${(bytes / 1e3).toFixed(1)} KB`;
  if (bytes < 1e9) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e9).toFixed(2)} GB`;
}

function ScanDot({ status }: { status: string }) {
  const color =
    status === "clean" ? "bg-emerald-500"
    : status === "flagged" ? "bg-red-500"
    : "bg-amber-400 animate-pulse";
  return (
    <span className={`w-1.5 h-1.5 rounded-full inline-block ${color}`} title={status} />
  );
}

const FOLDER_COLORS: Record<string, string> = {
  checkpoints: "bg-indigo-50 text-indigo-600",
  loras:       "bg-purple-50 text-purple-600",
  controlnet:  "bg-blue-50 text-blue-600",
  vae:         "bg-orange-50 text-orange-600",
  clip:        "bg-yellow-50 text-yellow-700",
  unet:        "bg-pink-50 text-pink-600",
  text_encoders: "bg-teal-50 text-teal-600",
};

export default function ModelsPage() {
  const [models, setModels] = useState<ModelRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadModels = useCallback(async () => {
    const { data } = await supabase
      .from("models_registry")
      .select("*")
      .order("filename");
    if (data) setModels(data as ModelRegistry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadModels();
  }, [loadModels]);

  const totalSize = models.reduce((s, m) => s + (m.size_bytes ?? 0), 0);
  const civitaiCount = models.filter((m) => m.civitai_model_id).length;

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className={`max-w-5xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Models</h1>
        <p className="text-sm text-neutral-500 font-geist-mono mt-1">Model registry</p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 overflow-x-auto pb-2 mb-8 -mx-6 px-6">
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] px-5 py-4 flex-1 min-w-[140px]">
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Total</p>
          <p className="text-2xl font-medium text-neutral-900">{models.length}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] px-5 py-4 flex-1 min-w-[140px]">
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Total Size</p>
          <p className="text-2xl font-medium text-neutral-900">{formatBytes(totalSize)}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] px-5 py-4 flex-1 min-w-[140px]">
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Civitai Linked</p>
          <p className="text-2xl font-medium text-neutral-900">{civitaiCount}</p>
        </div>
      </div>

      {/* Model list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl p-12 text-center">
          <p className="text-sm text-neutral-400 font-geist-mono">No models in registry.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {models.map((model, i) => (
            <div
              key={model.id}
              className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all p-4 flex items-center gap-4 opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Filename */}
              <div className="flex-1 min-w-0">
                <p className="font-geist-mono text-sm font-medium text-neutral-900 truncate">
                  {model.filename}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`text-[10px] font-geist-mono px-2 py-0.5 rounded-full ${
                      FOLDER_COLORS[model.target_folder] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {model.target_folder}
                  </span>
                  <span className="text-[10px] font-geist-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                    {model.format}
                  </span>
                  {model.base_model && (
                    <span className="text-[10px] font-geist-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                      {model.base_model}
                    </span>
                  )}
                </div>
              </div>

              {/* Size */}
              <div className="text-right shrink-0">
                <p className="font-geist-mono text-xs text-neutral-700">{formatBytes(model.size_bytes)}</p>
              </div>

              {/* SHA256 */}
              {model.sha256 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-geist-mono text-[10px] text-neutral-400">
                    {model.sha256.slice(0, 12)}
                  </span>
                  <button
                    onClick={() => copyHash(model.sha256!, model.id)}
                    className="text-neutral-400 hover:text-neutral-900 transition-colors"
                    title="Copy SHA256"
                  >
                    <Icon
                      icon={copied === model.id ? "solar:check-linear" : "solar:copy-linear"}
                      width={12}
                    />
                  </button>
                </div>
              )}

              {/* Safety scans */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-geist-mono text-[10px] text-neutral-400">virus</span>
                <ScanDot status={model.virus_scan} />
                <span className="font-geist-mono text-[10px] text-neutral-400">pickle</span>
                <ScanDot status={model.pickle_scan} />
              </div>

              {/* Civitai link */}
              {model.civitai_url && (
                <a
                  href={model.civitai_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
                >
                  <Icon icon="solar:link-linear" width={16} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
