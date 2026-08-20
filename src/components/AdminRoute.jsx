import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function AdminRoute() {
  const { isAuthenticated, isLoadingAuth, authChecked, user } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 grid place-items-center">
        <div className="h-8 w-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?returnTo=/admin" replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div className="max-w-sm space-y-2">
          <h1 className="font-heading text-2xl">Accesso riservato</h1>
          <p className="text-muted-foreground">Quest'area è riservata all'amministratore del progetto.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}