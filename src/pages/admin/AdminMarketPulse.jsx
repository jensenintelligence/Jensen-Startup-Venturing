import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Globe, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const cats = ["Equities", "Rates", "FX", "Commodities", "Crypto", "Macro"];
const sentiments = ["bullish", "bearish", "neutral", "volatile"];
const blank = { region: "", country: "", city: "", lat: "", lng: "", headline: "", sentiment: "neutral", indicator_name: "", indicator_value: "", change_percent: "", category: "Equities" };

export default function AdminMarketPulse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); try { setItems(await base44.entities.MarketPulse.list("-created_date", 200)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const startNew = () => { setForm(blank); setEditing(null); setOpen(true); };
  const startEdit = (p) => { setForm({ ...blank, ...p }); setEditing(p.id); setOpen(true); };

  const save = async () => {
    setSaving(true);
    try {
      const num = (v) => (v === "" || v == null ? null : Number(v));
      const payload = { ...form, lat: num(form.lat), lng: num(form.lng), change_percent: num(form.change_percent) };
      if (editing) await base44.entities.MarketPulse.update(editing, payload);
      else await base44.entities.MarketPulse.create({ ...payload, updated_date: new Date().toISOString() });
      setOpen(false); load();
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (!confirm("Eliminare questo punto mercato?")) return; await base44.entities.MarketPulse.delete(id); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="font-heading text-3xl font-semibold">Market Pulse</h1><p className="text-muted-foreground mt-1">Punti sulla mappa mondiale con sentiment e indicatori (stile terminale).</p></div>
        <Button onClick={startNew} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuovo punto</Button>
      </div>

      {loading ? <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" /> : items.length ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.city ? `${p.city}, ` : ""}{p.country || p.region}</p>
                <p className="text-xs text-muted-foreground truncate">{p.headline}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.sentiment === "bullish" ? "bg-emerald-50 text-emerald-700" : p.sentiment === "bearish" ? "bg-red-50 text-red-700" : p.sentiment === "volatile" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>{p.sentiment}</span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(p)} className="p-2 rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(p.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Globe} title="Nessun punto mercato" description="Aggiungi il primo centro finanziario alla mappa." action={<Button onClick={startNew} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuovo punto</Button>} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifica punto" : "Nuovo punto mercato"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Regione</Label><Input value={form.region} onChange={(e) => set("region", e.target.value)} className="mt-1.5" placeholder="Europe" /></div>
              <div><Label>Paese</Label><Input value={form.country} onChange={(e) => set("country", e.target.value)} className="mt-1.5" placeholder="Germany" /></div>
              <div><Label>Città</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} className="mt-1.5" placeholder="Frankfurt" /></div>
            </div>
            <div><Label>Headline</Label><Textarea value={form.headline} onChange={(e) => set("headline", e.target.value)} rows={2} className="mt-1.5" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Indicatore</Label><Input value={form.indicator_name} onChange={(e) => set("indicator_name", e.target.value)} className="mt-1.5" placeholder="DAX 40" /></div>
              <div><Label>Valore</Label><Input value={form.indicator_value} onChange={(e) => set("indicator_value", e.target.value)} className="mt-1.5" placeholder="18.420" /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Categoria</Label><select value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><Label>Sentiment</Label><select value={form.sentiment} onChange={(e) => set("sentiment", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{sentiments.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div><Label>Variazione %</Label><Input type="number" value={form.change_percent} onChange={(e) => set("change_percent", e.target.value)} className="mt-1.5" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Latitudine</Label><Input type="number" value={form.lat} onChange={(e) => set("lat", e.target.value)} className="mt-1.5" placeholder="50.11" /></div>
              <div><Label>Longitudine</Label><Input type="number" value={form.lng} onChange={(e) => set("lng", e.target.value)} className="mt-1.5" placeholder="8.68" /></div>
            </div>
            <p className="text-xs text-muted-foreground">Suggerimento coordinate: Milano 45.46/9.19 · Francoforte 50.11/8.68 · Londra 51.51/-0.13 · New York 40.71/-74.01 · Tokyo 35.68/139.69 · Hong Kong 22.32/114.17 · Dubai 25.20/55.27 · San Paolo -23.55/-46.63</p>
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