interface Props {
  label: string;
  value: string | number;
  sub?: string;
  dotColor?: string;
  loading?: boolean;
}

export default function MetricCard({ label, value, sub, dotColor, loading }: Props) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:bg-white/90 hover:border-neutral-300 transition-all p-5 min-w-[160px] flex-1">
      <div className="flex items-center gap-2 mb-3">
        {dotColor && (
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        )}
        <span className="font-geist-mono text-[10px] uppercase tracking-widest text-neutral-500">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-neutral-100 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-medium tracking-tight text-neutral-900">{value}</p>
      )}
      {sub && (
        <p className="text-xs text-neutral-400 font-geist-mono mt-1">{sub}</p>
      )}
    </div>
  );
}
