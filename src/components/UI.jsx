import { Link } from "react-router";

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}

export function StatCard({ label, value, detail, icon, tone = "blue" }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong>{value}</strong><small>{detail}</small></div>;
}

export function StateBadge({ state }) {
  return <span className={`state-badge state-${state}`}>{({ solicitada:"Solicitada", en_diagnostico:"En diagnóstico", presupuestada:"Presupuestada", aprobada:"Aprobada", en_reparacion:"En reparación", lista:"Lista", entregada:"Entregada", rechazada:"Rechazada", cancelada:"Cancelada" })[state] || state}</span>;
}

export function EmptyState({ title, description, action }) {
  return <div className="empty-state"><div className="empty-icon">▤</div><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function Loading() {
  return <div className="loading-state"><span className="spinner" />Cargando información...</div>;
}

export function ErrorMessage({ children }) {
  return children ? <div className="alert alert-error">{children}</div> : null;
}

export function OrderLink({ order }) {
  return <Link className="text-link" to={`/ordenes/${order.id}`}>Ver orden <span>↗</span></Link>;
}