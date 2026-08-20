import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LineChart, Activity, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import TradeCard from "@/components/TradeCard";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import DisclaimerBanner from "@/components/DisclaimerBanner";

function Stat({ icon: Icon, label, value, tone = "default" }) {
  const toneCls = tone === "pos" ? "text-emerald-600" : tone === "neg" ? "text-red-600" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold"><Icon className="h-4 w-4" /> {label}</div>
      <p className={`font-heading text-2xl font-semibold mt-2 ${toneCls}`}>{value}</p>
    </div>
  );
}

export default function Portfolio() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Trade.list("-open_date", 200);
        setTrades(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === "closed");
    const open = trades.filter((t) => t.status === "open");
    const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const wins = closed.filter((t) => (t.pnl ?? 0) >= 0);
    const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : 0;
    const worst = [...closed].sort((a, b) => (a.pnl ?? 0) - (b.pnl ?? 0))[0];
    const best = [...closed].sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0))[0];
    return { closed, open, totalPnl, winRate, worst, best };
  }, [trades]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-20"><div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">Documentazione</p>
      <h1 className="font-heading text-4xl font-semibold tracking-tight">Portafoglio Trade</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">Operazioni reali documentate — tesi, esito e lezioni. Uno strumento educativo per comprendere la teoria dietro ogni scelta, incluse le perdite.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        <Stat icon={Wallet} label="P&L realizzato" value={`${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toLocaleString("it-IT", { maximumFractionDigits: 0 })}€`} tone={stats.totalPnl >= 0 ? "pos" : "neg"} />
        <Stat icon={Activity} label="Posizioni aperte" value={stats.open.length} />
        <Stat icon={LineChart} label="Win rate" value={`${stats.winRate}%`} />
        <Stat icon={TrendingUp} label="Miglior trade" value={stats.best ? `${stats.best.instrument}` : "—"} />
      </div>

      <div className="mt-12">
        <SectionHeading eyebrow="Live" title="Posizioni aperte" />
        {stats.open.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stats.open.map((t) => <TradeCard key={t.id} trade={t} />)}</div>
        ) : (
          <EmptyState icon={Activity} title="Nessuna posizione aperta" description="Le posizioni attive appariranno qui." />
        )}
      </div>

      <div className="mt-12">
        <SectionHeading eyebrow="Lezioni apprese" title="Perdite più grandi" description="Documentare le perdite fa parte del metodo: ecco le operazioni chiuse in negativo più significative." />
        {stats.closed.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...stats.closed].sort((a, b) => (a.pnl ?? 0) - (b.pnl ?? 0)).slice(0, 6).map((t) => <TradeCard key={t.id} trade={t} />)}
          </div>
        ) : (
          <EmptyState icon={TrendingDown} title="Nessuna operazione chiusa" description="Le operazioni chiuse saranno documentate qui." />
        )}
      </div>

      <div className="mt-12">
        <SectionHeading eyebrow="Storico" title="Tutte le operazioni" />
        {trades.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{trades.map((t) => <TradeCard key={t.id} trade={t} />)}</div>
        ) : (
          <EmptyState icon={LineChart} title="Portafoglio vuoto" description="Le operazioni documentate appariranno qui." />
        )}
      </div>

      <div className="mt-12"><DisclaimerBanner variant="full" /></div>
    </div>
  );
}