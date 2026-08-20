import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Activity } from "lucide-react";
import MarketMap from "@/components/MarketMap";
import MarketTicker from "@/components/MarketTicker";
import NewsCard from "@/components/NewsCard";
import NewsDialog from "@/components/NewsDialog";
import EmptyState from "@/components/EmptyState";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const sentimentDot = {
  bullish: "bg-emerald-500",
  bearish: "bg-red-500",
  neutral: "bg-muted-foreground/50",
  volatile: "bg-accent",
};

const categories = ["Equities", "Rates", "FX", "Commodities", "Crypto", "Macro"];

export default function MarketPulse() {
  const [pulses, setPulses] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNews, setOpenNews] = useState(null);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const [p, n] = await Promise.all([
          base44.entities.MarketPulse.list("-updated_date", 100),
          base44.entities.NewsItem.filter({ is_published: true }, "-published_date", 30).catch(() => []),
        ]);
        setPulses(p);
        setNews(n);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => (cat === "All" ? pulses : pulses.filter((p) => p.category === cat)), [pulses, cat]);

  return (
    <div>
      <MarketTicker items={pulses} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">Market Pulse</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">Mercati in tempo reale</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Una mappa interattiva dei principali centri finanziari con sentiment e indicatori — stile terminale. Clicca sui punti per i dettagli.</p>

        {loading ? (
          <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin mx-auto mt-12" />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mt-8 mb-5">
              <button onClick={() => setCat("All")} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${cat === "All" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:bg-muted"}`}>Tutti</button>
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:bg-muted"}`}>{c}</button>
              ))}
            </div>

            <div><MarketMap points={filtered} /></div>

            <div className="flex flex-wrap items-center gap-4 mt-4 px-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Bullish</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Bearish</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-accent" /> Volatile</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" /> Neutrale</span>
              <span className="ml-auto">Il raggio del punto riflette l'intensità della variazione %</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {filtered.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${sentimentDot[p.sentiment] || sentimentDot.neutral}`} />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{p.city ? `${p.city}, ` : ""}{p.country || p.region}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{p.headline}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{p.indicator_name}</span>
                    <span className="font-semibold text-foreground">{p.indicator_value}{p.change_percent != null && <span className={p.change_percent > 0 ? "text-emerald-600 ml-1" : p.change_percent < 0 ? "text-red-600 ml-1" : "ml-1"}>{p.change_percent > 0 ? "+" : ""}{p.change_percent}%</span>}</span>
                  </div>
                </div>
              ))}
              {!filtered.length && (
                <div className="sm:col-span-2 lg:col-span-3"><EmptyState icon={Globe} title="Nessun punto in questa categoria" description="Seleziona un'altra categoria o torna a Tutti." /></div>
              )}
            </div>

            <div className="mt-14">
              <h2 className="font-heading text-2xl font-semibold mb-5">Notizie di mercato</h2>
              {news.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} news={n} onOpen={setOpenNews} />)}</div>
              ) : (
                <EmptyState icon={Activity} title="Nessuna notizia" description="Le notizie di mercato appariranno qui." />
              )}
            </div>

            <div className="mt-12"><DisclaimerBanner variant="full" /></div>
          </>
        )}
      </div>
      <NewsDialog news={openNews} open={!!openNews} onOpenChange={(o) => !o && setOpenNews(null)} />
    </div>
  );
}
