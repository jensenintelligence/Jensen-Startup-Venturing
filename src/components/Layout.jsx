import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Logo from "./Logo";
import DisclaimerBanner from "./DisclaimerBanner";

const nav = [
  { to: "/", label: "Home" },
  { to: "/papers", label: "Pubblicazioni" },
  { to: "/portfolio", label: "Portafoglio" },
  { to: "/markets", label: "Mercati" },
  { to: "/charts", label: "Chart Lab" },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            Ricerca indipendente su finanza, mercati e investimenti alternativi — derivati, short selling e asset non convenzionali.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Navigazione</p>
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="block text-sm text-foreground/70 hover:text-accent">{n.label}</Link>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">No-MIFID · Scopo educativo</p>
          <p>Tutti i contenuti sono pubblicati a fini formativi e non costituiscono consulenza finanziaria. Le performance passate non garantiscono risultati futuri.</p>
          <p className="text-muted-foreground/70">© {new Date().getFullYear()} Jensen Intelligence</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DisclaimerBanner variant="strip" />
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              return (
                <Link key={n.to} to={n.to} className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${active ? "text-accent" : "text-foreground/70 hover:text-foreground"}`}>{n.label}</Link>
              );
            })}
            <Link to="/admin" className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition">
              <LayoutDashboard className="h-4 w-4" /> Workspace
            </Link>
          </nav>
          <button className="md:hidden p-2 text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 flex flex-col gap-1">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md text-sm font-medium text-foreground/80 hover:bg-muted">{n.label}</Link>
              ))}
              <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Workspace</Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}