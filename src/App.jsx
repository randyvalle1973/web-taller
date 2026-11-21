
import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { healthCheck } from "./lib/pocketbase";

const links = [
  { to: "/", label: "Resumen", icon: "▦", end: true },
  { to: "/ordenes", label: "Órdenes", icon: "▤" },
  { to: "/clientes", label: "Clientes", icon: "♙" },
  { to: "/ajustes", label: "Ajustes", icon: "⚙" }
];

export default function App() {
  const [connection, setConnection] = useState("checking");
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("bluefix-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        await healthCheck();
        if (active) setConnection("online");
      } catch {
        if (active) setConnection("offline");
      }
    };

    check();
    const interval = setInterval(check, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <strong>BlueFix</strong>
            <span>Taller de reparaciones</span>
          </div>
        </div>

        <div className="nav-caption">MENÚ PRINCIPAL</div>

        <nav className="main-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className={`connection-pill ${connection}`}>
            <span className="connection-dot" />
            {connection === "online"
              ? "PocketBase conectado"
              : connection === "checking"
                ? "Comprobando conexión"
                : "Servidor desconectado"}
          </div>
          <div className="sidebar-note">
            Gestión sencilla, trabajo bajo control.
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark">B</div>
            <strong>BlueFix</strong>
          </div>

          <div className="topbar-right">
            <span className="today-label">
              {new Intl.DateTimeFormat("es", { dateStyle: "full" }).format(new Date())}
            </span>
            <div className="avatar">T</div>
            <span className="staff-label">Personal del taller</span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>

        <footer className="footer">
          BlueFix · Sistema de gestión del taller
        </footer>
      </main>
    </div>
  );
}
