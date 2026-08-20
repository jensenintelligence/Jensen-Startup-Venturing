import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LineChart as LineChartIcon, Activity, TrendingDown, TrendingUp, Wallet, Sparkles, ShieldCheck, ShieldAlert, Gauge } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
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

function EquityCurve({ trades }) {
  const points = useMemo(() => {
    const closed = trades.filter((t) => t.status === "closed" && t.close_date).sort((a, b) => new Date(a.close_date) - new Date(b.close_date));
    let cum = 0;
    return closed.map((t) => {
      cum += t.pnl ?? 0;
      return { date: new Date(t.close_date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }), equity: Math.round(cum) };
    });
  }, [trades]);

  if (points.length < 2) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground/80 mb-4">Curva equity — P&L cumulato dai trade chiusi</p>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => `${v}€`} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v}€`, "Equity cumulata"]}
            />
            <Area type="monotone" dataKey="equity" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#equityFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AiReview({ review }) {
  if (!review) return null;
  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <p className="text-xs font-semibold text-accent inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Revisione AI del metodo</p>
        {review.discipline_score != null && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-border"><Gauge className="h-3.5 w-3.5 text-accent" /> Disciplina: {review.discipline_score}/100</span>
        )}
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed">{review.summary}</p>
      <div className="grid gap-4 sm:grid-cols-2 mt-5">
        {review.strengths?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5 mb-2"><ShieldCheck className="h-3.5 w-3.5" /> Punti di forza</p>
            <ul className="text-sm text-foreground/75 space-y-1.5 list-disc pl-5">{review.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
        {review.weaknesses?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-700 inline-flex items-center gap-1.5 mb-2"><ShieldAlert className="h-3.5 w-3.5" /> Debolezze ricorrenti</p>
            <ul className="text-sm text-foreground/75 space-y-1.5 list-disc pl-5">{review.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>
      {review.recommendations?.length > 0 && (
        <div className="mt-5 pt-5 border-t border-accent/20">
          <p className="text-xs font-semibold text-foreground/80 mb-2">Raccomandazioni</p>
          <ul className="text-sm text-foreground/75 space-y-1.5 list-disc pl-5">{review.recommendations.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      <p className="text-[0.68rem] text-muted-foreground mt-5">Generata automaticamente il {new Date(review.generated_date).toLocaleDateString("it-IT")} · revisione metodologica a scopo educativo, non un giudizio di merito sulle singole operazioni.</p>
    </div>
  );
}

export default function Portfolio() {
  const [trades, setTrades] = useState([]);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [all, reviews] = await Promise.all([
          base44.entities.Trade.list("-open_date", 200),
          base44.entities.PortfolioReview.list("-generated_date", 1).catch(() => []),
        ]);
        setTrades(all);
        setReview(reviews?.[0] || null);
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
        <Stat icon={LineChartIcon} label="Win rate" value={`${stats.winRate}%`} />
        <Stat icon={TrendingUp} label="Miglior trade" value={stats.best ? `${stats.best.instrument}` : "—"} />
      </div>

      <div className="mt-8"><EquityCurve trades={trades} /></div>

      {review && <div className="mt-8"><AiReview review={review} /></div>}

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
          <EmptyState icon={LineChartIcon} title="Portafoglio vuoto" description="Le operazioni documentate appariranno qui." />
        )}
      </div>

      <div className="mt-12"><DisclaimerBanner variant="full" /></div>
    </div>
  );
}
