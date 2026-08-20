import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, LineChart, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const types = ["Equity", "ETF", "Derivative", "Option", "Future", "Forex", "Commodity", "Crypto", "Bond"];
const risks = ["low", "medium", "high", "very high"];
const blank = { instrument: "", instrument_type: "Equity", direction: "long", entry_price: "", exit_price: "", position_size: "", open_date: "", close_date: "", status: "open", pnl: "", pnl_percent: "", thesis: "", notes: "", lessons: "", screenshot_url: "", strategy: "", risk_level: "medium" };

export default function AdminTrades() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); try { setItems(await base44.entities.Trade.list("-open_date", 200)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const startNew = () => { setForm(blank); setEditing(null); setOpen(true); };
  const startEdit = (t) => { setForm({ ...blank, ...t }); setEditing(t.id); setOpen(true); };

  const onShot = async (e) => { const file = e.target.files?.[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); set("screenshot_url", file_url); };

  const save = async () => {
    setSaving(true);
    try {
      const num = (v) => (v === "" || v == null ? null : Number(v));
      const payload = { ...form, entry_price: num(form.entry_price), exit_price: num(form.exit_price), position_size: num(form.position_size), pnl: num(form.pnl), pnl_percent: num(form.pnl_percent) };
      if (editing) await base44.entities.Trade.update(editing, payload);
      else await base44.entities.Trade.create(payload);
      setOpen(false); load();
    } finally { setSaving(false); }
  };
  const del = async (id) => { if (!confirm("Eliminare questo trade?")) return; await base44.entities.Trade.delete(id); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="font-heading text-3xl font-semibold">Portafoglio Trade</h1><p className="text-muted-foreground mt-1">Documenta le operazioni: tesi, esito e lezioni.</p></div>
        <Button onClick={startNew} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuovo trade</Button>
      </div>

      {loading ? <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" /> : items.length ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {items.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4">
              <LineChart className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.instrument} <span className="text-xs text-muted-foreground">· {t.direction} · {t.instrument_type}</span></p>
                <p className="text-xs text-muted-foreground">{t.open_date ? new Date(t.open_date).toLocaleDateString("it-IT") : ""} {t.pnl != null && `· P&L ${t.pnl}€`}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "open" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>{t.status === "open" ? "Aperta" : "Chiusa"}</span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(t)} className="p-2 rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(t.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={LineChart} title="Nessun trade" description="Documenta la prima operazione." action={<Button onClick={startNew} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuovo trade</Button>} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifica trade" : "Nuovo trade"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Strumento</Label><Input value={form.instrument} onChange={(e) => set("instrument", e.target.value)} className="mt-1.5" placeholder="Es. AAPL, Put ESX, VIX call" /></div>
              <div><Label>Tipo</Label><select value={form.instrument_type} onChange={(e) => set("instrument_type", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{types.map((t) => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Direzione</Label><select value={form.direction} onChange={(e) => set("direction", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="long">Long</option><option value="short">Short</option></select></div>
              <div><Label>Stato</Label><select value={form.status} onChange={(e) => set("status", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="open">Aperta</option><option value="closed">Chiusa</option></select></div>
              <div><Label>Rischio</Label><select value={form.risk_level} onChange={(e) => set("risk_level", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{risks.map((r) => <option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div><Label>Entry</Label><Input type="number" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} className="mt-1.5" /></div>
              <div><Label>Exit</Label><Input type="number" value={form.exit_price} onChange={(e) => set("exit_price", e.target.value)} className="mt-1.5" /></div>
              <div><Label>Size</Label><Input type="number" value={form.position_size} onChange={(e) => set("position_size", e.target.value)} className="mt-1.5" /></div>
              <div><Label>P&L (€)</Label><Input type="number" value={form.pnl} onChange={(e) => set("pnl", e.target.value)} className="mt-1.5" /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Data apertura</Label><Input type="date" value={form.open_date?.slice(0, 10)} onChange={(e) => set("open_date", e.target.value)} className="mt-1.5" /></div>
              <div><Label>Data chiusura</Label><Input type="date" value={form.close_date?.slice(0, 10)} onChange={(e) => set("close_date", e.target.value)} className="mt-1.5" /></div>
              <div><Label>P&L %</Label><Input type="number" value={form.pnl_percent} onChange={(e) => set("pnl_percent", e.target.value)} className="mt-1.5" /></div>
            </div>
            <div><Label>Strategia</Label><Input value={form.strategy} onChange={(e) => set("strategy", e.target.value)} className="mt-1.5" placeholder="Es. mean reversion, dispersion trade" /></div>
            <div><Label>Tesi</Label><Textarea value={form.thesis} onChange={(e) => set("thesis", e.target.value)} rows={3} className="mt-1.5" /></div>
            <div><Label>Note</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="mt-1.5" /></div>
            <div><Label>Lezioni apprese</Label><Textarea value={form.lessons} onChange={(e) => set("lessons", e.target.value)} rows={2} className="mt-1.5" /></div>
            <div>
              <Label>Screenshot grafico</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm cursor-pointer hover:bg-muted">Carica<input type="file" accept="image/*" className="hidden" onChange={onShot} /></label>
                {form.screenshot_url && <img src={form.screenshot_url} className="h-12 w-20 object-cover rounded" />}
              </div>
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