import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen } from "lucide-react";
import PaperCard from "@/components/PaperCard";
import EmptyState from "@/components/EmptyState";

const categories = ["Macro", "Derivatives", "Short Selling", "Alternative Assets", "Quantitative", "Market Structure"];

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");

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

  const filtered = cat === "All" ? papers : papers.filter((p) => p.category === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">Ricerca</p>
      <h1 className="font-heading text-4xl font-semibold tracking-tight">Pubblicazioni</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">Paper brevi su finanza e mercati, con focus su investimenti alternativi. Contenuti a scopo educativo — No-MIFID.</p>

      <div className="flex flex-wrap gap-2 mt-8 mb-8">
        <button onClick={() => setCat("All")} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${cat === "All" ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:bg-muted"}`}>Tutti</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:bg-muted"}`}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin mx-auto" />
      ) : filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PaperCard key={p.id} paper={p} />)}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="Nessuna pubblicazione" description="Non ci sono ancora paper in questa categoria." />
      )}
    </div>
  );
}