import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Gauge, Clock3, ShieldAlert, History } from "lucide-react";

const horizonLabel = { "short-term": "Breve termine", "medium-term": "Medio termine", "long-term": "Lungo termine" };

function Metric({ icon: Icon, label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-accent" /> {label}: <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function NewsDialog({ news, open, onOpenChange }) {
  if (!news) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{news.category}</span>
            <span className="text-xs text-muted-foreground">{news.region}</span>
            {news.source && <span className="text-xs text-muted-foreground">· {news.source}</span>}
          </div>
          <DialogTitle className="font-heading text-2xl leading-tight">{news.title}</DialogTitle>
        </DialogHeader>
        {news.image_url && <img src={news.image_url} alt={news.title} className="w-full rounded-lg mb-4 max-h-72 object-cover" />}
        <p className="text-base text-muted-foreground font-medium">{news.summary}</p>
        {news.content && <div className="paper-prose mt-4" dangerouslySetInnerHTML={{ __html: news.content }} />}
        {news.ai_analysis && (
          <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-xs font-semibold text-accent inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Analisi deep-learning</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Metric icon={Gauge} label="Confidenza" value={news.confidence != null ? `${news.confidence}%` : null} />
                <Metric icon={Gauge} label="Impatto" value={news.market_impact_score != null ? `${news.market_impact_score}/10` : null} />
                <Metric icon={Clock3} label="Orizzonte" value={horizonLabel[news.impact_horizon] || null} />
              </div>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{news.ai_analysis}</p>
            {news.key_points?.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-foreground/80 list-disc pl-5">
                {news.key_points.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            )}
            {news.affected_assets?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {news.affected_assets.map((a, i) => <span key={i} className="text-[0.7rem] font-medium px-2 py-0.5 rounded-full bg-card border border-border text-foreground/70">{a}</span>)}
              </div>
            )}
            {news.risk_factors?.length > 0 && (
              <div className="mt-4 rounded-lg bg-card border border-border p-3">
                <p className="text-xs font-semibold text-foreground/80 inline-flex items-center gap-1.5 mb-1.5"><ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Fattori di rischio</p>
                <ul className="space-y-1 text-xs text-foreground/70 list-disc pl-5">
                  {news.risk_factors.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {news.historical_parallel && (
              <p className="mt-4 text-xs text-muted-foreground italic inline-flex items-start gap-1.5"><History className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {news.historical_parallel}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
