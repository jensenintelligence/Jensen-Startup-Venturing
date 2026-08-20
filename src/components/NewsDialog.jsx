import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

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
          <div className="mt-5 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="text-xs font-semibold text-accent inline-flex items-center gap-1.5 mb-2"><Sparkles className="h-3.5 w-3.5" /> Analisi Deep Learning</p>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{news.ai_analysis}</p>
            {news.key_points?.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-foreground/80 list-disc pl-5">
                {news.key_points.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}