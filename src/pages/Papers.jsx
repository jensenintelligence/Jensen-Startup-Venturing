import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BookOpen, Search, Clock, ArrowRight } from "lucide-react";
import PaperCard from "@/components/PaperCard";
import EmptyState from "@/components/EmptyState";

const categories = ["Macro", "Derivatives", "Short Selling", "Alternative Assets", "Quantitative", "Market Structure"];

function FeaturedPaper({ paper }) {
  const date = paper.published_date ? new Date(paper.published_date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <Link to={`/papers/${paper.id}`} className="group grid md:grid-cols-2 gap-0 rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/40 hover:shadow-md transition mb-10">
      <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
        {paper.cover_image ? (
          <img src={paper.cover_image} alt={paper.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-accent/10 to-muted"><BookOpen className="h-10 w-10 text-accent/40" /></div>
        )}
      </div>
      <div className="p-6 sm:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[0.68rem] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">In evidenza</span>
          <span className="text-xs text-muted-foreground">{paper.category}</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold leading-snug group-hover:text-accent transition">{paper.title}</h2>
        {paper.subtitle && <p className="text-muted-foreground mt-2">{paper.subtitle}</p>}
        <p className="text-sm text-foreground/70 mt-4 line-clamp-3">{paper.abstract}</p>
        <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
          {date && <span>{date}</span>}
          {paper.reading_time_min && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {paper.reading_time_min} min</span>}
          <span className="ml-auto text-accent font-medium inline-flex items-center gap-1">Leggi <ArrowRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  );
}

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Paper.filter({ status: "published" }, "-published_date", 100);
        setPapers(all);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = useMemo(() => papers.find((p) => p.featured), [papers]);

  const filtered = useMemo(() => {
    let list = cat === "All" ? papers : papers.filter((p) => p.category === cat);
    if (featured && cat === "All" && !q) list = list.filter((p) => p.id !== featured.id);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) => [p.title, p.subtitle, p.abstract].filter(Boolean).some((s) => s.toLowerCase().includes(needle)));
    }
    return list;
  }, [papers, cat, q, featured]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">Ricerca</p>
      <h1 className="font-heading text-4xl font-semibold tracking-tight">Pubblicazioni</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">Paper brevi su finanza e mercati, con focus su investimenti alternativi. Contenuti a scopo educativo — No-MIFID.</p>

      <div className="flex flex-wrap items-center gap-3 mt-8 mb-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca nei paper…" className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 mb-8">
        <button onClick={() => setCat("All")} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${cat === "All" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:bg-muted"}`}>Tutti</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:bg-muted"}`}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin mx-auto" />
      ) : (
        <>
          {featured && cat === "All" && !q && <FeaturedPaper paper={featured} />}
          {filtered.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <PaperCard key={p.id} paper={p} />)}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="Nessuna pubblicazione" description="Non ci sono paper che corrispondono alla ricerca." />
          )}
        </>
      )}
    </div>
  );
}
