import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Newspaper, Sparkles, Loader2, Star } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const cats = ["Macro", "Equities", "Rates", "FX", "Commodities", "Crypto", "Geopolitics"];
const regions = ["Global", "North America", "Europe", "Asia", "Emerging Markets", "LatAm"];
const blank = { title: "", summary: "", content: "", source: "", category: "Macro", region: "Global", importance: 3, is_featured: false, is_published: true, image_url: "", ai_analysis: "", sentiment: "neutral", key_points: [] };

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await base44.entities.NewsItem.list("-created_date", 200)); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => { setForm(blank); setEditing(null); setOpen(true); };
  const startEdit = (n) => { setForm({ ...blank, ...n }); setEditing(n.id); setOpen(true); };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("image_url", file_url);
  };

  const analyze = async () => {
    const text = [form.title, form.summary, form.content].filter(Boolean).join("\n\n");
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke("AnalyzeNews", { text });
      const a = res.data.analysis || {};
      setForm((f) => ({ ...f, ai_analysis: a.deep_analysis || f.ai_analysis, sentiment: a.sentiment || f.sentiment, key_points: a.key_points || [] }));
    } finally { setAnalyzing(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, importance: Number(form.importance), published_date: form.is_published && !form.published_date ? new Date().toISOString() : form.published_date };
      if (editing) await base44.entities.NewsItem.update(editing, payload);
      else await base44.entities.NewsItem.create(payload);
      setOpen(false); load();
    } finally { setSaving(false); }
  };

  const del = async (id) => { if (!confirm("Eliminare questa notizia?")) return; await base44.entities.NewsItem.delete(id); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Notizie & AI</h1>
          <p className="text-muted-foreground mt-1">Inserisci notizie di mercato e avvia l'analisi deep-learning. Segnala le notizie da spostare in home.</p>
        </div>
        <Button onClick={startNew} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuova notizia</Button>
      </div>

      {loading ? (
        <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      ) : items.length ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {items.map((n) => (
            <div key={n.id} className="flex items-center gap-4 p-4">
              <Newspaper className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.category} · {n.region} {n.ai_analysis && <span className="text-accent">· analisi AI</span>}</p>
              </div>
              {n.is_featured && <Star className="h-4 w-4 text-accent fill-accent" />}
              <span className={`text-xs px-2 py-0.5 rounded-full ${n.is_published ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{n.is_published ? "Pubblicata" : "Bozza"}</span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(n)} className="p-2 rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(n.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Newspaper} title="Nessuna notizia" description="Inserisci la prima notizia di mercato." action={<Button onClick={startNew} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuova notizia</Button>} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifica notizia" : "Nuova notizia"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Titolo</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5" /></div>
            <div><Label>Sommario</Label><Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={2} className="mt-1.5" /></div>
            <div><Label>Contenuto (opzionale)</Label><Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={4} className="mt-1.5" /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Categoria</Label><select value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><Label>Regione</Label><select value={form.region} onChange={(e) => set("region", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{regions.map((r) => <option key={r}>{r}</option>)}</select></div>
              <div><Label>Importanza (1-5)</Label><Input type="number" min={1} max={5} value={form.importance} onChange={(e) => set("importance", e.target.value)} className="mt-1.5" /></div>
            </div>
            <div><Label>Fonte</Label><Input value={form.source} onChange={(e) => set("source", e.target.value)} className="mt-1.5" /></div>
            <div>
              <Label>Immagine</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm cursor-pointer hover:bg-muted">Carica<input type="file" accept="image/*" className="hidden" onChange={onImage} /></label>
                {form.image_url && <img src={form.image_url} className="h-12 w-20 object-cover rounded" />}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={(v) => set("is_published", v)} /><Label className="text-sm">Pubblicata</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => set("is_featured", v)} /><Label className="text-sm">In evidenza in home</Label></div>
              <div>
                <Label className="text-sm">Sentiment</Label>
                <select value={form.sentiment} onChange={(e) => set("sentiment", e.target.value)} className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm">
                  <option value="bullish">Bullish</option><option value="bearish">Bearish</option><option value="neutral">Neutrale</option>
                </select>
              </div>
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-accent inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Analisi Deep Learning</p>
                <Button variant="outline" size="sm" onClick={analyze} disabled={analyzing} className="inline-flex items-center gap-1.5">{analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Analizza</Button>
              </div>
              {form.ai_analysis ? <p className="text-sm text-foreground/80 whitespace-pre-wrap">{form.ai_analysis}</p> : <p className="text-xs text-muted-foreground">Clicca "Analizza" per generare l'analisi AI sulla notizia.</p>}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving} className="inline-flex items-center gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Salva</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}