import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { listRecords, STATE_LABELS, money } from "../lib/pocketbase";
import { EmptyState, Loading, PageHeading, StateBadge, StatCard, ErrorMessage } from "../components/UI";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([listRecords("ordenes", { expand: "cliente" }), listRecords("clientes")])
      .then(([o, c]) => { if (active) { setOrders(o.items || []); setClients(c.items || []); } })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => {
    const result = {};
    orders.forEach(order => { result[order.estado] = (result[order.estado] || 0) + 1; });
    return result;
  }, [orders]);

  const activeOrders = orders.filter(o => !["entregada", "rechazada", "cancelada"].includes(o.estado));
  const recent = [...orders].slice(0, 6);
  const stages = ["solicitada", "en_diagnostico", "presupuestada", "aprobada", "en_reparacion", "lista", "entregada"];

  if (loading) return <Loading />;

  return <div className="page-stack">
    <PageHeading eyebrow="VISTA GENERAL" title="Resumen del taller" description="Una visión rápida de lo que está pasando en tu taller." action={<Link className="button button-primary" to="/ordenes/nueva"><span>＋</span> Nueva orden</Link>} />
    <ErrorMessage>{error}</ErrorMessage>
    <div className="stats-grid">
      <StatCard label="Órdenes registradas" value={orders.length} detail="Total de órdenes" icon="▤" />
      <StatCard label="En proceso" value={activeOrders.length} detail="Pendientes de completar" icon="◷" tone="purple" />
      <StatCard label="Listas para entregar" value={counts.lista || 0} detail="Reparaciones terminadas" icon="✓" tone="green" />
      <StatCard label="Clientes" value={clients.length} detail="Registrados en el sistema" icon="♙" tone="orange" />
    </div>
    <div className="dashboard-grid">
      <section className="panel stage-panel">
        <div className="panel-heading"><div><h2>Estado de las órdenes</h2><p>Distribución del trabajo por etapa</p></div><Link to="/ordenes" className="text-link">Ver todas ↗</Link></div>
        <div className="stage-list">
          {stages.map((stage, index) => <div className="stage-row" key={stage}><div className="stage-name"><span className={`stage-number stage-n-${index}`}>{index + 1}</span><span>{STATE_LABELS[stage]}</span></div><div className="stage-track"><span style={{ width: `${orders.length ? (counts[stage] || 0) / orders.length * 100 : 0}%` }} /></div><strong>{counts[stage] || 0}</strong></div>)}
        </div>
        <div className="alternate-states"><span>Salidas:</span><StateBadge state="rechazada" /> <StateBadge state="cancelada" /></div>
      </section>
      <section className="panel quick-panel">
        <div className="panel-heading"><div><h2>Accesos rápidos</h2><p>Operaciones frecuentes</p></div></div>
        <Link className="quick-action" to="/ordenes/nueva"><span className="quick-icon">＋</span><span><strong>Registrar equipo</strong><small>Crear una nueva orden</small></span><b>→</b></Link>
        <Link className="quick-action" to="/clientes"><span className="quick-icon aqua">♙</span><span><strong>Gestionar clientes</strong><small>Consultar y añadir clientes</small></span><b>→</b></Link>
        <Link className="quick-action" to="/ordenes"><span className="quick-icon violet">▤</span><span><strong>Buscar una orden</strong><small>Revisar el estado de un equipo</small></span><b>→</b></Link>
        <div className="tip-box"><span>✦</span><p><strong>Consejo</strong><br/>Mantén actualizado el estado de cada reparación para que el historial refleje el trabajo realizado.</p></div>
      </section>
    </div>
    <section className="panel">
      <div className="panel-heading"><div><h2>Órdenes recientes</h2><p>Últimos equipos registrados</p></div><Link to="/ordenes" className="text-link">Ver todas ↗</Link></div>
      {recent.length ? <div className="table-wrap"><table><thead><tr><th>Equipo</th><th>Cliente</th><th>Problema</th><th>Estado</th><th></th></tr></thead><tbody>{recent.map(order => <tr key={order.id}><td><strong>{order.equipo}</strong><small className="cell-sub">#{order.id.slice(0, 8)}</small></td><td>{order.expand?.cliente?.nombre || "Cliente"}</td><td className="problem-cell">{order.problema}</td><td><StateBadge state={order.estado} /></td><td><Link className="icon-link" to={`/ordenes/${order.id}`}>↗</Link></td></tr>)}</tbody></table></div> : <EmptyState title="Todavía no hay órdenes" description="Cuando registres el primer equipo, aparecerá aquí." action={<Link className="button button-secondary" to="/ordenes/nueva">Crear primera orden</Link>} />}
    </section>
  </div>;
}