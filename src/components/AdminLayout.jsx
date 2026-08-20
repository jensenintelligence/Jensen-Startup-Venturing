import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Newspaper, LineChart, Image, Globe, LogOut, ExternalLink } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/papers", label: "Pubblicazioni", icon: FileText },
  { to: "/admin/news", label: "Notizie & AI", icon: Newspaper },
  { to: "/admin/trades", label: "Portafoglio", icon: LineChart },
  { to: "/admin/charts", label: "Analisi Grafici", icon: Image },
  { to: "/admin/markets", label: "Market Pulse", icon: Globe },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <span className="rounded-lg bg-card px-2 py-1.5"><Logo to="/admin" withText={false} /></span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => {
            const active = l.end ? pathname === l.to : pathname.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}`}>
                <Icon className="h-4 w-4" /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50"><ExternalLink className="h-4 w-4" /> Vai al sito</Link>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50"><LogOut className="h-4 w-4" /> Esci</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background">
          <div className="lg:hidden"><Logo to="/admin" withText={false} /></div>
          <div className="hidden lg:block font-heading text-lg">Workspace</div>
          <div className="text-sm text-muted-foreground truncate ml-4">{user?.email}</div>
        </header>
        <div className="lg:hidden flex gap-1 overflow-x-auto no-scrollbar px-3 py-2 border-b border-border bg-background">
          {links.map((l) => {
            const active = l.end ? pathname === l.to : pathname.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to} className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted"}`}>
                <Icon className="h-3.5 w-3.5" /> {l.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}