"use client";

import type { ParamSchema } from "@/lib/types";

interface Props {
  schema: Record<string, ParamSchema>;
  defaults: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

export default function ParamForm({ schema, defaults, values, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(schema).map(([key, param]) => {
        const value = (values[key] ?? defaults[key] ?? "") as string | number | boolean;

        return (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
              {param.label ?? key}
            </label>

            {param.type === "select" && param.options ? (
              <select
                value={String(value)}
                onChange={(e) => onChange(key, e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 font-geist-mono focus:outline-none focus:border-neutral-400 transition-colors"
              >
                {param.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : param.type === "boolean" ? (
              <button
                type="button"
                onClick={() => onChange(key, !value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-geist-mono transition-all ${
                  value
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-neutral-50 text-neutral-500 border-neutral-200"
                }`}
              >
                {value ? "True" : "False"}
              </button>
            ) : param.type === "number" ? (
              <input
                type="number"
                value={Number(value)}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 font-geist-mono focus:outline-none focus:border-neutral-400 transition-colors"
              />
            ) : (
              <input
                type="text"
                value={String(value)}
                onChange={(e) => onChange(key, e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 font-geist-mono focus:outline-none focus:border-neutral-400 transition-colors"
              />
            )}

            {param.description && (
              <span className="text-[10px] text-neutral-400 font-geist-mono">
                {param.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
