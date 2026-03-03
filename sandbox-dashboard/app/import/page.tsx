"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";
import type { WorkflowImport, ImportReport } from "@/lib/types";

type SourceType = "paste" | "url" | "civitai";

function ImportReportView({ report }: { report: ImportReport }) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Class types */}
      {report.class_types?.length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
            Class Types ({report.class_types.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {report.class_types.map((ct) => (
              <span
                key={ct.name}
                className={`px-2 py-0.5 rounded-full text-xs font-geist-mono ${
                  ct.builtin
                    ? "bg-neutral-100 text-neutral-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {ct.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Models */}
      {report.models?.length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
            Models ({report.models.length})
          </p>
          <div className="flex flex-col gap-1">
            {report.models.map((m) => (
              <div key={m.filename} className="flex items-center gap-2 text-xs font-geist-mono">
                <span className={m.found ? "text-emerald-500" : "text-amber-500"}>
                  {m.found ? "✓" : "⚠"}
                </span>
                <span className="text-neutral-700">{m.filename}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Node packs */}
      {report.node_packs?.length > 0 && (
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
            Node Packs ({report.node_packs.length})
          </p>
          <div className="flex flex-col gap-1">
            {report.node_packs.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-xs font-geist-mono">
                <StatusBadge status={p.safety_status ?? (p.allowed ? "approved" : "review")} />
                <span className="text-neutral-700">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VRAM */}
      {report.estimated_vram_gb && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full w-fit">
          <span className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">Est. VRAM</span>
          <span className="font-geist-mono text-xs font-medium text-neutral-900">
            {report.estimated_vram_gb} GB
          </span>
        </div>
      )}
    </div>
  );
}

export default function ImportPage() {
  const [source, setSource] = useState<SourceType>("paste");
  const [value, setValue] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [imports, setImports] = useState<WorkflowImport[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadImports();
  }, []);

  const loadImports = async () => {
    const { data } = await supabase
      .from("workflow_imports")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setImports(data as WorkflowImport[]);
  };

  const handleAnalyze = async () => {
    if (!value.trim()) return;
    setAnalyzing(true);
    setError(null);

    try {
      let workflow_json: Record<string, unknown> | undefined;
      if (source === "paste") {
        workflow_json = JSON.parse(value);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-workflow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(
            source === "paste"
              ? { workflow_json, source_type: "paste" }
              : { source_type: source, source_value: value }
          ),
        }
      );

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Analysis failed");
      }

      await loadImports();
      setValue("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Import Workflow</h1>
        <p className="text-sm text-neutral-500 font-geist-mono mt-1">
          Paste ComfyUI API-format JSON to analyze dependencies
        </p>
      </div>

      {/* Import card */}
      <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 mb-8">
        {/* Source type pills */}
        <div className="flex gap-2 mb-5">
          {(["paste", "url", "civitai"] as SourceType[]).map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-geist-mono uppercase tracking-widest transition-all ${
                source === s
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input area */}
        {source === "paste" ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={'{ "1": { "class_type": "KSampler", ... } }'}
            rows={8}
            className="w-full bg-neutral-900 text-neutral-100 rounded-xl p-4 text-xs font-geist-mono resize-none focus:outline-none focus:ring-1 focus:ring-neutral-600 placeholder-neutral-600"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={source === "url" ? "https://..." : "Civitai model ID or URL"}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-geist-mono focus:outline-none focus:border-neutral-400 transition-colors"
          />
        )}

        {error && (
          <p className="text-xs text-red-500 font-geist-mono bg-red-50 px-3 py-2 rounded-lg mt-3">
            {error}
          </p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !value.trim()}
          className="glow-btn mt-4 w-full py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Icon icon="solar:telescope-linear" width={18} />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Import history */}
      <div>
        <h2 className="text-lg font-medium tracking-tight text-neutral-900 mb-4">Import History</h2>

        {imports.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl p-12 text-center">
            <p className="text-sm text-neutral-400 font-geist-mono">No imports yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {imports.map((imp, i) => (
              <div
                key={imp.id}
                className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all overflow-hidden"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <button
                  onClick={() => setExpanded(expanded === imp.id ? null : imp.id)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  {/* Source badge */}
                  <span className="font-geist-mono text-[10px] uppercase tracking-widest bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                    {imp.source_type}
                  </span>

                  <StatusBadge status={imp.status} />

                  <div className="flex gap-4 ml-auto text-[10px] font-geist-mono text-neutral-400 uppercase tracking-widest">
                    {imp.import_report?.class_types && (
                      <span>{imp.import_report.class_types.length} classes</span>
                    )}
                    {imp.import_report?.models && (
                      <span>{imp.import_report.models.length} models</span>
                    )}
                    {imp.import_report?.node_packs && (
                      <span>{imp.import_report.node_packs.length} packs</span>
                    )}
                    <span>{new Date(imp.created_at).toLocaleDateString()}</span>
                  </div>

                  <Icon
                    icon={expanded === imp.id ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
                    width={16}
                    className="text-neutral-400 flex-shrink-0"
                  />
                </button>

                {expanded === imp.id && imp.import_report && (
                  <div className="px-4 pb-4 border-t border-neutral-100">
                    <ImportReportView report={imp.import_report} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
