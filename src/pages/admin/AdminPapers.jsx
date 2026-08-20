import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

export default function AdminPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Paper.list("-created_date", 200);
      setPapers(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Eliminare definitivamente questo paper?")) return;
    await base44.entities.Paper.delete(id);
    load();
  };

  const filtered = useMemo(() => {
    if (!q.trim()) return papers;
    const needle = q.trim().toLowerCase();
    return papers.filter((p) => (p.title || "").toLowerCase().includes(needle) || (p.category || "").toLowerCase().includes(needle));
  }, [papers, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Pubblicazioni</h1>
          <p className="text-muted-foreground mt-1">Scrivi e gestisci i paper di ricerca.</p>
        </div>
        <Link to="/admin/papers/new"><Button className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuovo paper</Button></Link>
      </div>

      {papers.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per titolo o categoria…" className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      )}

      {loading ? (
        <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      ) : filtered.length ? (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.title || "Senza titolo"}</p>
                <p className="text-xs text-muted-foreground">{p.category} · {p.published_date ? new Date(p.published_date).toLocaleDateString("it-IT") : "non pubblicato"}</p>
              </div>
              {p.featured && <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent">In evidenza</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{p.status === "published" ? "Pubblicato" : "Bozza"}</span>
              <div className="flex items-center gap-1">
                <Link to={`/admin/papers/${p.id}/edit`} className="p-2 rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></Link>
                <button onClick={() => del(p.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="Nessuna pubblicazione" description="Crea il tuo primo paper di ricerca." action={<Link to="/admin/papers/new"><Button className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuovo paper</Button></Link>} />
      )}
    </div>
  );
}