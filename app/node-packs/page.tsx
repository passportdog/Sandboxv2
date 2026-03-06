"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";
import type { NodePackRegistry } from "@/lib/types";

const INSTALL_COLORS: Record<string, string> = {
  git_clone:        "bg-neutral-100 text-neutral-600",
  comfyui_manager:  "bg-blue-50 text-blue-600",
  pip:              "bg-purple-50 text-purple-600",
};

export default function NodePacksPage() {
  const [packs, setPacks] = useState<NodePackRegistry[]>([]);
  const [filtered, setFiltered] = useState<NodePackRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadPacks = useCallback(async () => {
    const { data } = await supabase
      .from("node_packs_registry")
      .select("*")
      .order("name");
    if (data) {
      setPacks(data as NodePackRegistry[]);
      setFiltered(data as NodePackRegistry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadPacks();
  }, [loadPacks]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(packs);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      packs.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.class_types.some((ct) => ct.toLowerCase().includes(q))
      )
    );
  }, [search, packs]);

  return (
    <div
      className={`max-w-5xl mx-auto px-6 pt-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Node Packs</h1>
          <p className="text-sm text-neutral-500 font-geist-mono mt-1">
            Custom node allowlist ({packs.length} packs)
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon
            icon="solar:magnifer-linear"
            width={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search packs or class types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-xl text-sm font-geist-mono focus:outline-none focus:border-neutral-400 transition-colors w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl p-12 text-center">
          <p className="text-sm text-neutral-400 font-geist-mono">
            {search ? "No packs match your search." : "No node packs in registry."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((pack, i) => (
            <div
              key={pack.id}
              className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all overflow-hidden opacity-0 animate-[fadeInUp_0.5s_ease_forwards]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <button
                onClick={() => setExpanded(expanded === pack.id ? null : pack.id)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-geist-mono text-sm font-medium text-neutral-900">
                      {pack.name}
                    </span>
                    {pack.requires_restart && (
                      <span title="Requires restart" className="text-amber-500">⚡</span>
                    )}
                  </div>
                  <a
                    href={pack.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-geist-mono text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors truncate block max-w-xs"
                  >
                    {pack.repo_url}
                  </a>
                </div>

                {/* Commit */}
                <span className="font-geist-mono text-[10px] bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full shrink-0">
                  {pack.pinned_commit.slice(0, 8)}
                </span>

                {/* Install method */}
                <span
                  className={`font-geist-mono text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    INSTALL_COLORS[pack.install_method] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {pack.install_method}
                </span>

                <StatusBadge status={pack.safety_status} />

                <span className="font-geist-mono text-[10px] text-neutral-400 shrink-0">
                  {pack.class_types.length} classes
                </span>

                <Icon
                  icon={expanded === pack.id ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
                  width={16}
                  className="text-neutral-400 flex-shrink-0"
                />
              </button>

              {expanded === pack.id && (
                <div className="px-4 pb-4 border-t border-neutral-100">
                  <p className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-3 mb-2">
                    Class Types
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pack.class_types.map((ct) => (
                      <span
                        key={ct}
                        className="font-geist-mono text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full"
                      >
                        {ct}
                      </span>
                    ))}
                  </div>
                  {pack.notes && (
                    <p className="text-xs text-neutral-500 font-geist-mono mt-3">{pack.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
