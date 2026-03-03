"use client";

import { Icon } from "@iconify/react";
import type { RunEvent } from "@/lib/types";

interface TimelineEntry {
  id: string;
  icon: string;
  iconColor?: string;
  title: string;
  timestamp: string;
  description?: string;
}

interface Props {
  entries: TimelineEntry[];
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export function eventToTimelineEntry(
  event: RunEvent & { endpoint_slug?: string }
): TimelineEntry {
  const iconMap: Record<string, { icon: string; color: string }> = {
    created:         { icon: "solar:add-circle-linear",      color: "text-neutral-400"  },
    worker_assigned: { icon: "solar:server-square-linear",   color: "text-neutral-400"  },
    submitted:       { icon: "solar:upload-linear",           color: "text-neutral-400"  },
    executing:       { icon: "solar:play-circle-linear",      color: "text-amber-500"    },
    progress:        { icon: "solar:play-circle-linear",      color: "text-amber-500"    },
    output_ready:    { icon: "solar:gallery-linear",          color: "text-blue-500"     },
    uploading:       { icon: "solar:upload-linear",           color: "text-blue-500"     },
    vaulted:         { icon: "solar:safe-square-linear",      color: "text-neutral-400"  },
    succeeded:       { icon: "solar:check-circle-linear",     color: "text-emerald-500"  },
    failed:          { icon: "solar:close-circle-linear",     color: "text-red-500"      },
    worker_released: { icon: "solar:server-square-linear",    color: "text-neutral-400"  },
    cancelled:       { icon: "solar:close-circle-linear",     color: "text-neutral-400"  },
    timeout:         { icon: "solar:clock-circle-linear",     color: "text-red-500"      },
    approved:        { icon: "solar:shield-check-linear",     color: "text-emerald-500"  },
    rejected:        { icon: "solar:shield-cross-linear",     color: "text-red-500"      },
  };

  const cfg = iconMap[event.event_type] ?? { icon: "solar:info-circle-linear", color: "text-neutral-400" };

  return {
    id: event.id,
    icon: cfg.icon,
    iconColor: cfg.color,
    title: event.event_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    timestamp: formatTimestamp(event.created_at),
    description: event.message ?? (event.endpoint_slug ? `Endpoint: ${event.endpoint_slug}` : undefined),
  };
}

export default function Timeline({ entries }: Props) {
  return (
    <div className="flex flex-col gap-3 relative timeline-connector">
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          className="flex gap-6 group relative z-10 opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease_forwards]"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="w-14 shrink-0 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full bg-white border border-neutral-200/80 shadow-sm flex items-center justify-center group-hover:border-neutral-300 transition-all z-10 ${entry.iconColor ?? "text-neutral-400"}`}
            >
              <Icon icon={entry.icon} width={18} />
            </div>
          </div>
          <div className="flex-1 pb-8 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <h3 className="text-sm font-medium text-neutral-900">{entry.title}</h3>
              <span className="text-[10px] text-neutral-400 font-geist-mono uppercase tracking-widest">
                {entry.timestamp}
              </span>
            </div>
            {entry.description && (
              <p className="text-xs text-neutral-500 font-geist-mono">{entry.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
