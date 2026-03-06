interface Props {
  status: string;
  pulse?: boolean;
  className?: string;
}

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  // endpoint statuses
  draft:       { dot: "bg-neutral-400",               text: "text-neutral-500", label: "Draft"       },
  quarantine:  { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Quarantine"  },
  approved:    { dot: "bg-emerald-500",               text: "text-emerald-700", label: "Live"        },
  deprecated:  { dot: "bg-red-500",                   text: "text-red-600",     label: "Deprecated"  },
  // run statuses
  pending:     { dot: "bg-neutral-300",               text: "text-neutral-500", label: "Pending"     },
  submitted:   { dot: "bg-blue-400 animate-pulse",    text: "text-blue-600",    label: "Submitted"   },
  executing:   { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Executing"   },
  uploading:   { dot: "bg-blue-400 animate-pulse",    text: "text-blue-600",    label: "Uploading"   },
  succeeded:   { dot: "bg-emerald-500",               text: "text-emerald-700", label: "Succeeded"   },
  failed:      { dot: "bg-red-500",                   text: "text-red-600",     label: "Failed"      },
  cancelled:   { dot: "bg-neutral-400",               text: "text-neutral-500", label: "Cancelled"   },
  timed_out:   { dot: "bg-red-400",                   text: "text-red-600",     label: "Timed Out"   },
  // pod statuses
  creating:    { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Creating"    },
  booting:     { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Booting"     },
  ready:       { dot: "bg-emerald-500",               text: "text-emerald-700", label: "Ready"       },
  busy:        { dot: "bg-emerald-500",               text: "text-emerald-700", label: "Busy"        },
  idle:        { dot: "bg-neutral-300",               text: "text-neutral-500", label: "Idle"        },
  stopping:    { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Stopping"    },
  stopped:     { dot: "bg-neutral-300",               text: "text-neutral-500", label: "Stopped"     },
  error:       { dot: "bg-red-500",                   text: "text-red-600",     label: "Error"       },
  restoring:   { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Restoring"   },
  restarting:  { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Restarting"  },
  // node pack safety
  review:      { dot: "bg-amber-400",                 text: "text-amber-600",   label: "Review"      },
  blocked:     { dot: "bg-red-500",                   text: "text-red-600",     label: "Blocked"     },
  // model scan
  clean:       { dot: "bg-emerald-500",               text: "text-emerald-700", label: "Clean"       },
  flagged:     { dot: "bg-red-500",                   text: "text-red-600",     label: "Flagged"     },
  // analyzed
  analyzing:   { dot: "bg-amber-400 animate-pulse",   text: "text-amber-600",   label: "Analyzing"   },
  analyzed:    { dot: "bg-blue-500",                  text: "text-blue-600",    label: "Analyzed"    },
  resolved:    { dot: "bg-emerald-500",               text: "text-emerald-700", label: "Resolved"    },
  deployed:    { dot: "bg-emerald-500",               text: "text-emerald-700", label: "Deployed"    },
};

export default function StatusBadge({ status, className = "" }: Props) {
  const cfg = STATUS_STYLES[status] ?? { dot: "bg-neutral-300", text: "text-neutral-500", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`font-geist-mono uppercase tracking-widest text-[10px] ${cfg.text}`}>
        {cfg.label}
      </span>
    </span>
  );
}
