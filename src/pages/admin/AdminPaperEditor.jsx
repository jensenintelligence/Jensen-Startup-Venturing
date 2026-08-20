import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload, Loader2, Wand2 } from "lucide-react";

const categories = ["Macro", "Derivatives", "Short Selling", "Alternative Assets", "Quantitative", "Market Structure"];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    [{ align: [] }],
    ["clean"],
  ],
};

const blank = { title: "", subtitle: "", abstract: "", content: "", category: "Macro", tags: "", cover_image: "", reading_time_min: "", status: "draft", featured: false, author_note: "", published_date: "" };

export default function AdminPaperEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await base44.entities.Paper.get(id);
        setForm({ ...blank, ...p, tags: (p.tags || []).join(", ") });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const estimateReadingTime = () => {
    const text = (form.content || "").replace(/<[^>]+>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    set("reading_time_min", Math.max(1, Math.round(words / 200)));
  };

  const onCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("cover_image", file_url);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        abstract: form.abstract,
        content: form.content,
        category: form.category,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        cover_image: form.cover_image,
        reading_time_min: form.reading_time_min ? Number(form.reading_time_min) : null,
        status: form.status,
        featured: form.featured,
        author_note: form.author_note,
        published_date: form.status === "published" && !form.published_date ? new Date().toISOString() : form.published_date,
      };
      if (id) await base44.entities.Paper.update(id, payload);
      else await base44.entities.Paper.create(payload);
      navigate("/admin/papers");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" />;

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Indietro</button>
      <div>
        <h1 className="font-heading text-3xl font-semibold">{id ? "Modifica paper" : "Nuovo paper"}</h1>
        <p className="text-muted-foreground mt-1">Struttura: titolo, abstract, contenuto. Ricorda il disclaimer No-MIFID.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Titolo</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Es. Short Selling su settore X" className="mt-1.5 text-lg" />
        </div>
        <div>
          <Label>Sottotitolo</Label>
          <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Una riga di contesto" className="mt-1.5" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Categoria</Label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Tempo di lettura (min)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input type="number" value={form.reading_time_min} onChange={(e) => set("reading_time_min", e.target.value)} />
              <Button type="button" variant="outline" size="icon" title="Calcola dal contenuto" onClick={estimateReadingTime}><Wand2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
        <div>
          <Label>Tag (separati da virgola)</Label>
          <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="derivati, volatilità, macro" className="mt-1.5" />
        </div>
        <div>
          <Label>Abstract</Label>
          <Textarea value={form.abstract} onChange={(e) => set("abstract", e.target.value)} rows={3} placeholder="Sintesi del paper" className="mt-1.5" />
        </div>
        <div>
          <Label>Copertina</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm cursor-pointer hover:bg-muted">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Carica immagine
              <input type="file" accept="image/*" className="hidden" onChange={onCover} />
            </label>
            {form.cover_image && <img src={form.cover_image} className="h-12 w-20 object-cover rounded" />}
          </div>
        </div>
        <div>
          <Label>Contenuto</Label>
          <div className="mt-1.5 bg-white rounded-md border border-input">
            <ReactQuill theme="snow" value={form.content} onChange={(v) => set("content", v)} modules={quillModules} placeholder="Scrivi il paper qui..." className="paper-quill" />
          </div>
        </div>
        <div>
          <Label>Nota dell'autore (opzionale)</Label>
          <Textarea value={form.author_note} onChange={(e) => set("author_note", e.target.value)} rows={2} className="mt-1.5" />
        </div>
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-muted/30 p-4">
          <div>
            <Label>Stato</Label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="mt-1.5 h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="draft">Bozza</option>
              <option value="published">Pubblicato</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
            <Label className="text-sm">In evidenza in home</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={save} disabled={saving} className="inline-flex items-center gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salva</Button>
        <Button variant="outline" onClick={() => navigate("/admin/papers")}>Annulla</Button>
      </div>
    </div>
  );
}