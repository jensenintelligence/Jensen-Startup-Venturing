import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, TrendingUp, TrendingDown, Minus, Activity, Gauge } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const biasStyle = {
  bullish: { label: "Bullish", icon: TrendingUp, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  bearish: { label: "Bearish", icon: TrendingDown, cls: "bg-red-50 text-red-700 border-red-200" },
  neutral: { label: "Neutrale", icon: Minus, cls: "bg-muted text-muted-foreground border-border" },
  volatile: { label: "Volatile", icon: Activity, cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

function ChartCard({ c }) {
  const b = biasStyle[c.trend_bias] || biasStyle.neutral;
  const BIcon = b.icon;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <img src={c.image_url} alt={c.title} className="w-full h-52 object-cover bg-muted" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading text-lg font-semibold leading-snug">{c.title}</h3>
            {(c.instrument || c.timeframe) && <p className="text-xs text-muted-foreground mt-0.5">{c.instrument}{c.timeframe ? ` · ${c.timeframe}` : ""}</p>}
          </div>
          <span className={`inline-flex items-center gap-1 text-[0.68rem] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${b.cls}`}><BIcon className="h-3 w-3" /> {b.label}</span>
        </div>
        {c.summary && <p className="text-sm text-foreground/80">{c.summary}</p>}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {c.confidence != null && <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5 text-accent" /> Confidenza {c.confidence}%</span>}
          {c.risk_level && <span>Rischio: <strong className="text-foreground/80">{c.risk_level}</strong></span>}
        </div>
        {(c.support_levels?.length > 0 || c.resistance_levels?.length > 0) && (
          <div className="text-xs text-foreground/70 border-t border-border pt-3 space-y-1">
            {c.support_levels?.length > 0 && <p><span className="text-emerald-600 font-medium">Supporti:</span> {c.support_levels.join(", ")}</p>}
            {c.resistance_levels?.length > 0 && <p><span className="text-red-600 font-medium">Resistenze:</span> {c.resistance_levels.join(", ")}</p>}
          </div>
        )}
        {c.ai_analysis && (
          <details className="text-xs mt-auto pt-2">
            <summary className="cursor-pointer text-accent font-medium">Leggi l'analisi completa</summary>
            <div className="mt-2 text-foreground/75 whitespace-pre-wrap leading-relaxed">{c.ai_analysis}</div>
          </details>
        )}
      </div>
    </div>
  );
}

export default function ChartLab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.ChartAnalysis.filter({ status: "completed" }, "-created_date", 60);
        setItems(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">Chart Lab</p>
      <h1 className="font-heading text-4xl font-semibold tracking-tight">Analisi grafici tecnici</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">Letture tecniche generate con l'ausilio dell'AI su grafici reali — livelli, pattern e scenari operativi, con la metodologia sempre esplicitata. Materiale a scopo educativo.</p>

      {loading ? (
        <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin mx-auto mt-12" />
      ) : items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {items.map((c) => <ChartCard key={c.id} c={c} />)}
        </div>
      ) : (
        <div className="mt-10"><EmptyState icon={ImageIcon} title="Nessuna analisi pubblicata" description="Le analisi tecniche completate appariranno qui." /></div>
      )}

      <div className="mt-12"><DisclaimerBanner variant="full" /></div>
    </div>
  );
}
