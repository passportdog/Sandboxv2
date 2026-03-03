"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import type { Endpoint } from "@/lib/types";
import ParamForm from "./ParamForm";

interface Props {
  endpoint: Endpoint;
  onClose: () => void;
  onSubmitted?: (runId: string) => void;
}

type Caller = "manual" | "ghosta" | "api";

export default function RunModal({ endpoint, onClose, onSubmitted }: Props) {
  const [params, setParams] = useState<Record<string, unknown>>(endpoint.default_params ?? {});
  const [caller, setCaller] = useState<Caller>("manual");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRunId, setCreatedRunId] = useState<string | null>(null);

  const handleChange = (key: string, value: unknown) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/run-workflow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            endpoint_slug: endpoint.slug,
            params,
            caller,
            async: true,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start run");
      setCreatedRunId(data.run_id ?? data.id);
      onSubmitted?.(data.run_id ?? data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white/90 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-medium text-neutral-900">Run Endpoint</h2>
            <p className="font-geist-mono text-xs text-neutral-500 mt-0.5">{endpoint.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
          >
            <Icon icon="solar:close-linear" width={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {createdRunId ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Icon icon="solar:check-circle-linear" className="text-emerald-500" width={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Run Created</p>
                <p className="font-geist-mono text-xs text-neutral-500 mt-1">{createdRunId}</p>
              </div>
              <a
                href="/runs"
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                View Run →
              </a>
            </div>
          ) : (
            <>
              {/* Params */}
              {Object.keys(endpoint.param_schema ?? {}).length > 0 ? (
                <ParamForm
                  schema={endpoint.param_schema}
                  defaults={endpoint.default_params ?? {}}
                  values={params}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-sm text-neutral-400 text-center py-4">No parameters required.</p>
              )}

              {/* Caller */}
              <div className="flex flex-col gap-2">
                <label className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  Caller
                </label>
                <div className="flex gap-2">
                  {(["manual", "ghosta", "api"] as Caller[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCaller(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-geist-mono uppercase tracking-widest transition-all ${
                        caller === c
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-geist-mono bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="glow-btn w-full py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:play-circle-linear" width={18} />
                    Submit Run
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
