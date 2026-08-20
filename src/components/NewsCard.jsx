import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";

const sentimentMap = {
  bullish: { label: "Bullish", icon: TrendingUp, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  bearish: { label: "Bearish", icon: TrendingDown, cls: "text-red-700 bg-red-50 border-red-200" },
  neutral: { label: "Neutrale", icon: Minus, cls: "text-muted-foreground bg-muted/50 border-border" },
};

export default function NewsCard({ news, onOpen }) {
  const s = sentimentMap[news.sentiment] || sentimentMap.neutral;
  const SIcon = s.icon;
  const date = news.published_date ? new Date(news.published_date).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : null;
  return (
    <button onClick={() => onOpen?.(news)} className="text-left flex flex-col rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-sm transition overflow-hidden">
      {news.image_url && (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img src={news.image_url} alt={news.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[0.68rem] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{news.category}</span>
          {news.importance >= 4 && <span className="text-[0.68rem] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">In evidenza</span>}
          {date && <span className="text-xs text-muted-foreground ml-auto">{date}</span>}
        </div>
        <h3 className="font-heading text-lg font-semibold leading-snug">{news.title}</h3>
        <p className="text-sm text-foreground/70 mt-2 line-clamp-3 flex-1">{news.summary}</p>
        <div className="flex items-center justify-between mt-4">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${s.cls}`}><SIcon className="h-3.5 w-3.5" /> {s.label}</span>
          {news.ai_analysis && <span className="inline-flex items-center gap-1 text-xs text-accent"><Sparkles className="h-3.5 w-3.5" /> Analisi AI</span>}
        </div>
      </div>
    </button>
  );
}