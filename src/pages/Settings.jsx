
import { useEffect, useState } from "react";
import { PageHeading } from "../components/UI";

export default function Settings() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("bluefix-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("bluefix-theme", theme);
  }, [theme]);

  return (
    <div className="page-stack narrow-page">
      <PageHeading
        eyebrow="PREFERENCIAS"
        title="Ajustes"
        description="Personaliza la apariencia de BlueFix."
      />

      <section className="panel">
        <div className="connection-illustration">
          <div className="server-icon">◐</div>
          <div>
            <h2>Apariencia</h2>
            <p>Selecciona el tema visual de la aplicación.</p>
          </div>
        </div>

        <div className="form-stack">
          <label htmlFor="theme-select">Tema de la aplicación</label>
          <select
            id="theme-select"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            <option value="light">Modo claro</option>
            <option value="dark">Modo oscuro</option>
          </select>
        </div>
      </section>
    </div>
  );
}
