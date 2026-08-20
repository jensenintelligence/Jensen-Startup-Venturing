import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

const dirMap = {
  long: { label: "Long", icon: TrendingUp, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  short: { label: "Short", icon: TrendingDown, cls: "bg-red-50 text-red-700 border-red-200" },
};

export default function TradeCard({ trade }) {
  const d = dirMap[trade.direction] || dirMap.long;
  const DIcon = d.icon;
  const open = trade.status === "open";
  const pnl = trade.pnl ?? 0;
  const positive = pnl >= 0;
  const pnlPct = trade.pnl_percent;
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[0.68rem] font-semibold px-2 py-0.5 rounded-full border ${d.cls}`}><DIcon className="h-3 w-3" /> {d.label}</span>
            <span className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-full ${open ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>{open ? "Aperta" : "Chiusa"}</span>
          </div>
          <h3 className="font-heading text-lg font-semibold mt-2">{trade.instrument}</h3>
          <p className="text-xs text-muted-foreground">{trade.instrument_type}{trade.strategy ? ` · ${trade.strategy}` : ""}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-1 font-heading text-lg font-semibold ${positive ? "text-emerald-600" : "text-red-600"}`}>
            {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {positive ? "+" : ""}{pnl.toLocaleString("it-IT", { maximumFractionDigits: 0 })}€
          </div>
          {pnlPct != null && <div className={`text-xs ${positive ? "text-emerald-600" : "text-red-600"}`}>{positive ? "+" : ""}{pnlPct.toFixed(2)}%</div>}
        </div>
      </div>
      {trade.thesis && <p className="text-sm text-foreground/70 line-clamp-2">{trade.thesis}</p>}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <span>Entry: {trade.entry_price ?? "—"}</span>
        <span>{trade.open_date ? new Date(trade.open_date).toLocaleDateString("it-IT") : "—"}</span>
      </div>
    </div>
  );
}