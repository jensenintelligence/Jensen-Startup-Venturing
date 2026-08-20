import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText, Newspaper, LineChart, Image, Globe, Plus, ArrowRight, Activity, Sparkles, Loader2, DatabaseZap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [data, setData] = useState({ papers: [], news: [], trades: [], charts: [], pulses: [] });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  const load = async () => {
    const [papers, news, trades, charts, pulses] = await Promise.all([
      base44.entities.Paper.list("-created_date", 100),
      base44.entities.NewsItem.list("-created_date", 100),
      base44.entities.Trade.list("-open_date", 100),
      base44.entities.ChartAnalysis.list("-created_date", 100),
      base44.entities.MarketPulse.list("-created_date", 100),
    ].map((p) => p.catch(() => [])));
    setData({ papers, news, trades, charts, pulses });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCount = data.trades.filter((t) => t.status === "open").length;
  const cards = [
    { label: "Pubblicazioni", value: data.papers.length, sub: `${data.papers.filter((p) => p.status === "draft").length} bozze`, icon: FileText, to: "/admin/papers" },
    { label: "Notizie", value: data.news.length, sub: `${data.news.filter((n) => n.is_featured).length} in evidenza`, icon: Newspaper, to: "/admin/news" },
    { label: "Trade aperti", value: openCount, sub: `${data.trades.length} totali`, icon: LineChart, to: "/admin/trades" },
    { label: "Analisi grafici", value: data.charts.length, icon: Image, to: "/admin/charts" },
    { label: "Market Pulse", value: data.pulses.length, icon: Globe, to: "/admin/markets" },
  ];

  const seedDemoContent = async (force = false) => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await base44.functions.invoke("SeedDemoContent", { force });
      if (res.data?.skipped) {
        setSeedMsg("Ci sono già contenuti nel database. Rilancia con conferma per aggiungere comunque i demo.");
      } else {
        const c = res.data?.created || {};
        setSeedMsg(`Creati: ${c.papers ?? 0} paper, ${c.trades ?? 0} trade, ${c.news ?? 0} notizie, ${c.market_pulse ?? 0} punti mercato.`);
        load();
      }
    } catch (e) {
      setSeedMsg("Errore durante la generazione dei contenuti demo.");
    } finally {
      setSeeding(false);
    }
  };

  const generatePortfolioReview = async () => {
    setReviewing(true);
    setReviewMsg("");
    try {
      const trades = await base44.entities.Trade.list("-open_date", 200);
      const res = await base44.functions.invoke("AnalyzePortfolio", { trades });
      const a = res.data?.analysis;
      const snap = res.data?.snapshot || {};
      if (a) {
        await base44.entities.PortfolioReview.create({
          summary: a.summary,
          strengths: a.strengths || [],
          weaknesses: a.weaknesses || [],
          risk_patterns: a.risk_patterns || [],
          recommendations: a.recommendations || [],
          discipline_score: a.discipline_score,
          trades_analyzed: snap.trades_analyzed,
          win_rate_snapshot: snap.win_rate_snapshot,
          pnl_snapshot: snap.pnl_snapshot,
          generated_date: new Date().toISOString(),
        });
        setReviewMsg("Revisione AI generata e pubblicata sulla pagina Portafoglio.");
      } else {
        setReviewMsg("Nessuna analisi restituita: servono almeno alcuni trade chiusi.");
      }
    } catch (e) {
      setReviewMsg("Errore durante la generazione della revisione.");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Panoramica del progetto Jensen Intelligence.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.to} to={c.to} className="group rounded-xl border border-border bg-card p-5 hover:border-accent/40 hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-accent" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition" />
              </div>
              <p className="font-heading text-3xl font-semibold mt-3">{loading ? "—" : c.value}</p>
              <p className="text-sm font-medium text-foreground/80">{c.label}</p>
              {c.sub && <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>}
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1"><DatabaseZap className="h-4 w-4 text-accent" /><h2 className="font-heading text-lg font-semibold">Azioni rapide AI</h2></div>
        <p className="text-sm text-muted-foreground mb-4">Strumenti per popolare il sito con contenuti dimostrativi realistici e generare analisi automatiche.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">Popola contenuti dimostrativi</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Aggiunge 6 paper, 10 trade, 10 notizie e 14 punti Market Pulse realistici, così il sito non appare vuoto ai visitatori. Non sovrascrive nulla di esistente salvo conferma.</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={seeding} onClick={() => seedDemoContent(false)} className="inline-flex items-center gap-1.5">{seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Genera contenuti demo</Button>
              {seedMsg?.includes("già contenuti") && <Button size="sm" variant="ghost" disabled={seeding} onClick={() => seedDemoContent(true)}>Forza comunque</Button>}
            </div>
            {seedMsg && <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" /> {seedMsg}</p>}
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">Revisione AI del portafoglio</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Analizza i trade chiusi e genera una revisione comportamentale (punti di forza, debolezze, rischi ricorrenti) pubblicata sulla pagina Portafoglio.</p>
            <Button size="sm" variant="outline" disabled={reviewing} onClick={generatePortfolioReview} className="inline-flex items-center gap-1.5">{reviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />} Genera revisione</Button>
            {reviewMsg && <p className="text-xs text-muted-foreground mt-2">{reviewMsg}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Pubblicazioni recenti</h2>
            <Link to="/admin/papers/new" className="inline-flex items-center gap-1 text-sm text-accent hover:underline"><Plus className="h-4 w-4" /> Nuovo</Link>
          </div>
          <div className="space-y-2">
            {data.papers.slice(0, 5).map((p) => (
              <Link key={p.id} to={`/admin/papers/${p.id}/edit`} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0 hover:text-accent">
                <span className="text-sm truncate">{p.title || "Senza titolo"}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{p.status === "published" ? "Pubblicato" : "Bozza"}</span>
              </Link>
            ))}
            {!data.papers.length && <p className="text-sm text-muted-foreground">Nessuna pubblicazione.</p>}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Trade recenti</h2>
            <Link to="/admin/trades" className="inline-flex items-center gap-1 text-sm text-accent hover:underline"><Plus className="h-4 w-4" /> Nuovo</Link>
          </div>
          <div className="space-y-2">
            {data.trades.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
                <span className="text-sm truncate">{t.instrument} <span className="text-xs text-muted-foreground">({t.direction})</span></span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "open" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>{t.status === "open" ? "Aperta" : "Chiusa"}</span>
              </div>
            ))}
            {!data.trades.length && <p className="text-sm text-muted-foreground">Nessun trade.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
