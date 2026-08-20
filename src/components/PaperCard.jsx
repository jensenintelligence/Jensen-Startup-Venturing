import { Link } from "react-router-dom";
import { FileText, Clock } from "lucide-react";

const categoryColors = {
  Macro: "bg-amber-100 text-amber-800",
  Derivatives: "bg-rose-100 text-rose-800",
  "Short Selling": "bg-red-100 text-red-800",
  "Alternative Assets": "bg-emerald-100 text-emerald-800",
  Quantitative: "bg-sky-100 text-sky-800",
  "Market Structure": "bg-violet-100 text-violet-800",
};

export default function PaperCard({ paper }) {
  const date = paper.published_date ? new Date(paper.published_date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }) : null;
  return (
    <Link to={`/papers/${paper.id}`} className="group flex flex-col rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-md transition overflow-hidden">
      {paper.cover_image && (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img src={paper.cover_image} alt={paper.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[0.68rem] font-semibold px-2 py-0.5 rounded-full ${categoryColors[paper.category] || "bg-muted text-muted-foreground"}`}>{paper.category}</span>
          {date && <span className="text-xs text-muted-foreground">{date}</span>}
        </div>
        <h3 className="font-heading text-xl font-semibold leading-snug group-hover:text-accent transition">{paper.title}</h3>
        {paper.subtitle && <p className="text-sm text-muted-foreground mt-1">{paper.subtitle}</p>}
        <p className="text-sm text-foreground/70 mt-3 line-clamp-3 flex-1">{paper.abstract}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          {paper.reading_time_min && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {paper.reading_time_min} min</span>}
          <span className="inline-flex items-center gap-1 text-accent font-medium"><FileText className="h-3.5 w-3.5" /> Leggi</span>
        </div>
      </div>
    </Link>
  );
}