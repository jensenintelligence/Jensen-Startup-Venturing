import { ShieldCheck } from "lucide-react";

export default function DisclaimerBanner({ variant = "strip" }) {
  if (variant === "strip") {
    return (
      <div className="bg-primary text-primary-foreground/85 text-[0.72rem]">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center justify-center gap-2 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
          <span>Progetto educativo · No-MIFID · I contenuti non costituiscono consulenza finanziaria né sollecitazione all'investimento.</span>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-5 flex gap-3">
      <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
      <div className="text-sm text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Disclaimer · Progetto educativo No-MIFID</p>
        <p>Jensen Intelligence è un progetto individuale a scopo divulgativo e formativo. Le pubblicazioni, le analisi e il portafoglio documentato hanno finalità esclusivamente educative e non rappresentano consulenza finanziaria, raccomandazione d'investimento né sollecitazione all'acquisto o alla vendita di alcuno strumento finanziario. L'autore non è regolamentato ai sensi della Direttiva MIFID II.</p>
      </div>
    </div>
  );
}