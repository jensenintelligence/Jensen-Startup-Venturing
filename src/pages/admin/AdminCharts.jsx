import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image as ImageIcon, Sparkles, Trash2, Loader2, Upload, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const biasStyle = {
  bullish: { icon: TrendingUp, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  bearish: { icon: TrendingDown, cls: "bg-red-50 text-red-700 border-red-200" },
  neutral: { icon: Minus, cls: "bg-muted text-muted-foreground border-border" },
  volatile: { icon: Activity, cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function AdminCharts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", instrument: "", timeframe: "", image_url: "" });
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => { setLoading(true); try { setItems(await base44.entities.ChartAnalysis.list("-created_date", 100)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); set("image_url", file_url); } finally { setUploading(false); }
  };

  const analyze = async () => {
    if (!form.image_url) return;
    setAnalyzing(true);
    try {
      const ch = await base44.entities.ChartAnalysis.create({ title: form.title || "Grafico", image_url: form.image_url, instrument: form.instrument, timeframe: form.timeframe, status: "analyzing" });
      try {
        const res = await base44.functions.invoke("AnalyzeChart", { image_url: form.image_url, instrument: form.instrument, timeframe: form.timeframe });
        const a = res.data.analysis || {};
        await base44.entities.ChartAnalysis.update(ch.id, {
          ai_analysis: a.full_analysis || "",
          summary: a.summary || "",
          trend_bias: a.trend_bias || "neutral",
          confidence: a.confidence ?? null,
          risk_level: a.risk_level || "medium",
          support_levels: a.support_levels || [],
          resistance_levels: a.resistance_levels || [],
          patterns: a.patterns || [],
          bullish_trigger: a.bullish_trigger || "",
          bullish_target: a.bullish_target || "",
          bearish_trigger: a.bearish_trigger || "",
          bearish_invalidation: a.bearish_invalidation || "",
          status: "completed",
        });
      } catch (err) {
        await base44.entities.ChartAnalysis.update(ch.id, { status: "failed" });
      }
      setForm({ title: "", instrument: "", timeframe: "", image_url: "" });
      setOpen(false); load();
    } finally { setAnalyzing(false); }
  };

  const del = async (id) => { if (!confirm("Eliminare questa analisi?")) return; await base44.entities.ChartAnalysis.delete(id); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="font-heading text-3xl font-semibold">Analisi Grafici</h1><p className="text-muted-foreground mt-1">Carica screenshot di grafici di trading e ottieni un'analisi tecnica AI strutturata. Le analisi completate sono visibili pubblicamente in "Analisi Grafici".</p></div>
        <Button onClick={() => { setForm({ title: "", instrument: "", timeframe: "", image_url: "" }); setOpen(true); }} className="inline-flex items-center gap-2"><Upload className="h-4 w-4" /> Carica grafico</Button>
      </div>

      {loading ? <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" /> : items.length ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((c) => {
            const b = biasStyle[c.trend_bias] || biasStyle.neutral;
            const BIcon = b.icon;
            return (
              <div key={c.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <img src={c.image_url} alt={c.title} className="w-full h-48 object-cover bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{c.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${c.status === "completed" ? "bg-emerald-50 text-emerald-700" : c.status === "analyzing" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{c.status === "completed" ? "Completata" : c.status === "analyzing" ? "In analisi" : "Fallita"}</span>
                  </div>
                  {(c.instrument || c.timeframe) && <p className="text-xs text-muted-foreground -mt-2">{c.instrument} {c.timeframe ? `· ${c.timeframe}` : ""}</p>}
                  {c.status === "completed" ? (
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[0.68rem] font-semibold px-2 py-0.5 rounded-full border ${b.cls}`}><BIcon className="h-3 w-3" /> {c.trend_bias || "neutral"}</span>
                        {c.confidence != null && <span className="text-[0.68rem] text-muted-foreground">Confidenza {c.confidence}%</span>}
                        {c.risk_level && <span className="text-[0.68rem] text-muted-foreground">Rischio {c.risk_level}</span>}
                      </div>
                      {c.summary && <p className="text-xs text-foreground/85 font-medium">{c.summary}</p>}
                      {(c.support_levels?.length > 0 || c.resistance_levels?.length > 0) && (
                        <p className="text-[0.7rem] text-muted-foreground">
                          {c.support_levels?.length > 0 && <>Supporti: {c.support_levels.join(", ")}. </>}
                          {c.resistance_levels?.length > 0 && <>Resistenze: {c.resistance_levels.join(", ")}.</>}
                        </p>
                      )}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-accent font-medium">Analisi completa</summary>
                        <p className="text-foreground/75 whitespace-pre-wrap mt-1.5 max-h-40 overflow-y-auto">{c.ai_analysis}</p>
                      </details>
                    </div>
                  ) : c.status === "analyzing" ? <p className="text-xs text-muted-foreground">Analisi in corso…</p> : <p className="text-xs text-red-600">Analisi fallita.</p>}
                  <button onClick={() => del(c.id)} className="text-xs text-red-600 inline-flex items-center gap-1 hover:underline"><Trash2 className="h-3 w-3" /> Elimina</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={ImageIcon} title="Nessuna analisi" description="Carica il primo screenshot di un grafico." action={<Button onClick={() => setOpen(true)} className="inline-flex items-center gap-2"><Upload className="h-4 w-4" /> Carica grafico</Button>} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Nuova analisi grafico</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Titolo</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5" placeholder="Es. SPX 4H - divergenza RSI" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Strumento</Label><Input value={form.instrument} onChange={(e) => set("instrument", e.target.value)} className="mt-1.5" /></div>
              <div><Label>Timeframe</Label><Input value={form.timeframe} onChange={(e) => set("timeframe", e.target.value)} className="mt-1.5" placeholder="15m, 1H, 4H, daily" /></div>
            </div>
            <div>
              <Label>Screenshot</Label>
              <div className="mt-1.5">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm cursor-pointer hover:bg-muted">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Carica immagine<input type="file" accept="image/*" className="hidden" onChange={onFile} /></label>
                {form.image_url && <img src={form.image_url} className="mt-3 w-full rounded-lg max-h-60 object-contain bg-muted" />}
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={analyze} disabled={analyzing || !form.image_url} className="inline-flex items-center gap-2">{analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analizza con AI</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
