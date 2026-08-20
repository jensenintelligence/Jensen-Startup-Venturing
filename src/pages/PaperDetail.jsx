import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Clock, Calendar, Tag, List } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PaperCard from "@/components/PaperCard";

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9àèéìòù\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

// Injects ids into <h2> headings so a table of contents can link to them.
function withHeadingIds(html) {
  if (!html || typeof window === "undefined") return { html, toc: [] };
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const toc = [];
    doc.querySelectorAll("h2").forEach((h, i) => {
      const text = h.textContent || `Sezione ${i + 1}`;
      const id = `${slugify(text)}-${i}`;
      h.id = id;
      toc.push({ id, text });
    });
    return { html: doc.body.innerHTML, toc };
  } catch {
    return { html, toc: [] };
  }
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (scrolled / max) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-50">
      <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await base44.entities.Paper.get(id);
        setPaper(p);
        base44.entities.Paper.filter({ status: "published", category: p.category }, "-published_date", 6)
          .then((all) => setRelated(all.filter((x) => x.id !== id).slice(0, 3)))
          .catch(() => {});
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const { html, toc } = useMemo(() => withHeadingIds(paper?.content || ""), [paper?.content]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-20"><div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" /></div>;
  if (notFound || !paper) return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="font-heading text-2xl">Paper non trovato</p>
      <Link to="/papers" className="text-accent hover:underline mt-3 inline-block">← Torna alle pubblicazioni</Link>
    </div>
  );

  const date = paper.published_date ? new Date(paper.published_date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <article>
      <ReadingProgress />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4" /> Indietro</button>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/15 text-accent">{paper.category}</span>
          {paper.tags?.map((t) => <span key={t} className="text-xs text-muted-foreground inline-flex items-center gap-1"><Tag className="h-3 w-3" /> {t}</span>)}
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">{paper.title}</h1>
        {paper.subtitle && <p className="text-xl text-muted-foreground mt-4 font-heading italic">{paper.subtitle}</p>}

        <div className="flex flex-wrap items-center gap-5 mt-6 pb-6 border-b border-border text-sm text-muted-foreground">
          {date && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {date}</span>}
          {paper.reading_time_min && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {paper.reading_time_min} min di lettura</span>}
          <span className="text-foreground/60">Jensen Intelligence · Ricerca indipendente</span>
        </div>

        {paper.cover_image && <img src={paper.cover_image} alt={paper.title} className="w-full rounded-xl my-8 max-h-96 object-cover" />}

        {paper.abstract && (
          <div className="rounded-xl border-l-2 border-accent bg-accent/5 p-5 my-8">
            <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-2">Abstract</p>
            <p className="text-lg text-foreground/90 leading-relaxed font-medium">{paper.abstract}</p>
          </div>
        )}

        {toc.length > 1 && (
          <nav className="rounded-xl border border-border bg-muted/30 p-5 my-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 inline-flex items-center gap-1.5"><List className="h-3.5 w-3.5" /> In questo paper</p>
            <ol className="space-y-1.5">
              {toc.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-sm text-foreground/75 hover:text-accent inline-flex gap-2">
                    <span className="text-muted-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</span> {t.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="paper-prose" dangerouslySetInnerHTML={{ __html: html }} />

        {paper.author_note && (
          <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Nota dell'autore</p>
            <p className="text-sm text-foreground/80">{paper.author_note}</p>
          </div>
        )}

        <div className="mt-10">
          <DisclaimerBanner variant="full" />
        </div>
      </div>

      {related.length > 0 && (
        <div className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-5">Continua a leggere</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((p) => <PaperCard key={p.id} paper={p} />)}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
