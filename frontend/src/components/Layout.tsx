import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const links = [
  { to: "/",           label: "Pessoas",     icon: "👤" },
  { to: "/categoria",  label: "Categorias",  icon: "🏷️" },
  { to: "/transacao",  label: "Transações",  icon: "💸" },
  { to: "/relatorio",  label: "Relatório",   icon: "📊" },
];

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">💰</div>
          <h1>GastosApp</h1>
          <span>Controle residencial</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Menu</div>
          <nav className="sidebar-nav">
            {links.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => isActive ? "nav-ativo" : undefined}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="env-pill">
            <strong>API</strong>
            localhost:5202
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
