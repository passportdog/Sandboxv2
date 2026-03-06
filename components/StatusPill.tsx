"use client";

import { usePods } from "@/lib/hooks/usePods";
import { useRuns } from "@/lib/hooks/useRuns";

function getDotColor(status: string) {
  if (status === "online") return "bg-emerald-500";
  if (status === "busy") return "bg-amber-400 animate-pulse";
  if (status === "error") return "bg-red-500";
  return "bg-neutral-300";
}

export default function StatusPill() {
  const { pods } = usePods();
  const { activeRuns } = useRuns();

  let status = "offline";
  let label = "Offline";

  const readyPods = pods.filter((p) => ["ready", "busy", "idle"].includes(p.status));
  const busyPods = pods.filter((p) => p.status === "busy");
  const errorPods = pods.filter((p) => p.status === "error");

  if (errorPods.length > 0) {
    status = "error";
    label = "Pod Error";
  } else if (activeRuns.length > 0 || busyPods.length > 0) {
    status = "busy";
    label = `${activeRuns.length} Running`;
  } else if (readyPods.length > 0) {
    status = "online";
    label = "Online";
  }

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-neutral-200/80 bg-white/60 backdrop-blur-xl shadow-sm transition-all duration-500 hover:bg-white hover:border-neutral-300 group cursor-default">
      <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${getDotColor(status)}`} />
      <span className="text-xs font-medium text-neutral-600 font-geist-mono uppercase tracking-widest transition-colors duration-500 group-hover:text-neutral-900">
        {label}
      </span>
    </div>
  );
}
