import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { listRecords } from "../lib/pocketbase";
import { EmptyState, ErrorMessage, Loading, PageHeading, StateBadge } from "../components/UI";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("todas");

  useEffect(() => {
    let active = true;
    listRecords("ordenes", { expand: "cliente" })
      .then(data => { if (active) setOrders(data.items || []); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const term = `${o.equipo} ${o.problema} ${o.expand?.cliente?.nombre || ""} ${o.id}`.toLowerCase();
    return term.includes(search.toLowerCase()) && (state === "todas" || o.estado === state);
  }), [orders, search, state]);

  if (loading) return <Loading />;
  return <div className="page-stack">
    <PageHeading eyebrow="GESTIÓN DEL TRABAJO" title="Órdenes de reparación" description="Consulta y controla cada equipo que entra al taller." action={<Link className="button button-primary" to="/ordenes/nueva">＋ Nueva orden</Link>} />
    <ErrorMessage>{error}</ErrorMessage>
    <section className="panel">
      <div className="filters-row">
        <div className="search-box order-search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar equipo, cliente o código..." /></div>
        <select value={state} onChange={e => setState(e.target.value)} aria-label="Filtrar por estado">
          <option value="todas">Todos los estados</option>
          {["solicitada","en_diagnostico","presupuestada","aprobada","en_reparacion","lista","entregada","rechazada","cancelada"].map(s => <option key={s} value={s}>{({solicitada:"Solicitada",en_diagnostico:"En diagnóstico",presupuestada:"Presupuestada",aprobada:"Aprobada",en_reparacion:"En reparación",lista:"Lista",entregada:"Entregada",rechazada:"Rechazada",cancelada:"Cancelada"})[s]}</option>)}
        </select>
      </div>
      <div className="results-caption">Mostrando <strong>{filtered.length}</strong> de {orders.length} órdenes</div>
      {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Equipo</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>{filtered.map(order => <tr key={order.id}><td><strong>{order.equipo}</strong><small className="cell-sub">#{order.id.slice(0, 8)}</small></td><td>{order.expand?.cliente?.nombre || "—"}</td><td>{new Date(order.created).toLocaleDateString("es")}</td><td><StateBadge state={order.estado} /></td><td><Link className="button button-small button-ghost" to={`/ordenes/${order.id}`}>Abrir orden</Link></td></tr>)}</tbody></table></div> : <EmptyState title="No hay órdenes para mostrar" description="Cambia los filtros o registra un equipo nuevo." action={<Link className="button button-secondary" to="/ordenes/nueva">Crear orden</Link>} />}
    </section>
  </div>;
}