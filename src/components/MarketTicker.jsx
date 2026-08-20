export default function MarketTicker({ items = [] }) {
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden bg-primary text-primary-foreground border-y border-accent/20">
      <div className="flex whitespace-nowrap animate-ticker py-2">
        {row.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-xs font-medium">
            <span className="text-accent font-semibold">{it.city || it.country || it.region}</span>
            {it.indicator_name && <span className="text-primary-foreground/60">{it.indicator_name}</span>}
            {it.indicator_value && <span className="text-primary-foreground/85">{it.indicator_value}</span>}
            {it.change_percent != null && (
              <span className={it.change_percent > 0 ? "text-emerald-400" : it.change_percent < 0 ? "text-red-400" : "text-primary-foreground/60"}>
                {it.change_percent > 0 ? "+" : ""}{it.change_percent}%
              </span>
            )}
            <span className="text-accent/40 px-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}