import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BookOpen, LineChart, ArrowRight, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import PaperCard from "@/components/PaperCard";
import NewsCard from "@/components/NewsCard";
import TradeCard from "@/components/TradeCard";
import MarketTicker from "@/components/MarketTicker";
import NewsDialog from "@/components/NewsDialog";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import EmptyState from "@/components/EmptyState";

function Spinner() {
  return <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin mx-auto" />;
}

export default function Home() {
  const [data, setData] = useState({ news: [], papers: [], trades: [], pulses: [] });
  const [loading, setLoading] = useState(true);
  const [openNews, setOpenNews] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [featured, papers, trades, pulses] = await Promise.all([
          base44.entities.NewsItem.filter({ is_featured: true, is_published: true }, "-published_date", 6).catch(() => []),
          base44.entities.Paper.filter({ status: "published" }, "-published_date", 6).catch(() => []),
          base44.entities.Trade.list("-open_date", 50).catch(() => []),
          base44.entities.MarketPulse.list("-updated_date", 30).catch(() => []),
        ]);
        const news = featured.length ? featured : await base44.entities.NewsItem.filter({ is_published: true }, "-published_date", 6).catch(() => []);
        setData({ news, papers, trades, pulses });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openTrades = data.trades.filter((t) => t.status === "open").slice(0, 3);
  const worstTrades = [...data.trades].filter((t) => t.status === "closed").sort((a, b) => (a.pnl ?? 0) - (b.pnl ?? 0)).slice(0, 3);

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-4">Progetto individuale · No-MIFID</p>
          <h1 className="font-heading text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl leading-[1.05]">
            Ricerca su finanza, mercati e <span className="text-accent">investimenti alternativi</span>.
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl">
            Paper brevi su derivati, short selling e asset non convenzionali — affiancati da un portafoglio trade documentato e da un'analisi di mercato in tempo reale. Tutto a scopo educativo.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/papers" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"><BookOpen className="h-4 w-4" /> Esplora le pubblicazioni</Link>
            <Link to="/portfolio" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-muted"><LineChart className="h-4 w-4" /> Portafoglio trade</Link>
          </div>
        </div>
      </section>

      <MarketTicker items={data.pulses} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 space-y-16">
        {loading ? (
          <div className="py-20"><Spinner /></div>
        ) : (
          <>
            <section>
              <SectionHeading eyebrow="Notizie in evidenza" title="Dal mercato" description="Aggiornamenti selezionati dall'autore, con analisi deep-learning quando disponibile." to="/markets" toLabel="Tutti i mercati" />
              {data.news.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.news.map((n) => <NewsCard key={n.id} news={n} onOpen={setOpenNews} />)}
                </div>
              ) : (
                <EmptyState icon={Activity} title="Nessuna notizia in evidenza" description="Le notizie selezionate appariranno qui." />
              )}
            </section>

            <section>
              <SectionHeading eyebrow="Portafoglio trade documentato" title="Posizioni & perdite" description="La teoria applicata: ultime posizioni aperte e perdite più significative, per capire il metodo dietro ogni operazione." to="/portfolio" toLabel="Portafoglio completo" />
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-foreground/80 mb-3 inline-flex items-center gap-2"><Activity className="h-4 w-4 text-accent" /> Posizioni aperte</p>
                  {openTrades.length ? (
                    <div className="space-y-4">{openTrades.map((t) => <TradeCard key={t.id} trade={t} />)}</div>
                  ) : (
                    <EmptyState title="Nessuna posizione aperta" description="Le nuove posizioni appariranno qui." />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground/80 mb-3 inline-flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" /> Perdite più grandi</p>
                  {worstTrades.length ? (
                    <div className="space-y-4">{worstTrades.map((t) => <TradeCard key={t.id} trade={t} />)}</div>
                  ) : (
                    <EmptyState icon={AlertTriangle} title="Nessuna perdita registrata" description="Le operazioni chiuse in perdita saranno documentate qui." />
                  )}
                </div>
              </div>
            </section>

            <section>
              <SectionHeading eyebrow="Pubblicazioni" title="Ultimi paper" description="Ricerca breve su macro, derivati, short selling e asset alternativi." to="/papers" toLabel="Tutti i paper" />
              {data.papers.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.papers.map((p) => <PaperCard key={p.id} paper={p} />)}
                </div>
              ) : (
                <EmptyState icon={BookOpen} title="Nessuna pubblicazione" description="I primi paper appariranno qui." />
              )}
            </section>

            <DisclaimerBanner variant="full" />
          </>
        )}
      </div>

      <NewsDialog news={openNews} open={!!openNews} onOpenChange={(o) => !o && setOpenNews(null)} />
    </div>
  );
}