
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fileUrl, getRecord, listRecords, money, quoteTotal, STATE_LABELS, updateRecord } from "../lib/pocketbase";
import { ErrorMessage, Loading, PageHeading, StateBadge } from "../components/UI";

const nextState = {
  solicitada: "en_diagnostico",
  en_diagnostico: "presupuestada",
  aprobada: "en_reparacion",
  en_reparacion: "lista",
  lista: "entregada"
};

function formatDate(value) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleString("es");
}
export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [manoObra, setManoObra] = useState("0");
  const [parts, setParts] = useState([]);
  const [newPart, setNewPart] = useState({ descripcion: "", cantidad: "1", precio: "0" });

  const refresh = async () => {
    const [record, history] = await Promise.all([
      getRecord("ordenes", id, { expand: "cliente" }),
      listRecords("eventos", { filter: `orden="${id}"` })
    ]);
    setOrder(record);
    console.log("REGISTRO COMPLETO:", record);
console.log("CAMPOS DEL REGISTRO:", Object.keys(record));
    setEvents(history.items || []);
    console.log("FECHAS DE EVENTOS:", history.items?.map(event => ({
  id: event.id,
  created: event.created
})));
    setDiagnostico(record.diagnostico || "");
    setManoObra(String(record.manoObra ?? 0));
    setParts(Array.isArray(record.piezas) ? record.piezas : []);
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      getRecord("ordenes", id, { expand: "cliente" }),
      listRecords("eventos", { filter: `orden="${id}"` })
    ])
      .then(([record, history]) => {
        if (active) {
          setOrder(record);
          setEvents(history.items || []);
          setDiagnostico(record.diagnostico || "");
          setManoObra(String(record.manoObra ?? 0));
          setParts(Array.isArray(record.piezas) ? record.piezas : []);
        }
      })
      .catch(e => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const changeState = async (values) => {
    setSaving(true);
    setError("");

    try {
      await updateRecord("ordenes", id, values);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addPart = e => {
    e.preventDefault();

    if (!newPart.descripcion.trim() || Number(newPart.cantidad) <= 0 || Number(newPart.precio) < 0) return;

    setParts([
      ...parts,
      {
        ...newPart,
        cantidad: Number(newPart.cantidad),
        precio: Number(newPart.precio)
      }
    ]);

    setNewPart({ descripcion: "", cantidad: "1", precio: "0" });
  };

  const saveQuote = () => {
    if (!diagnostico.trim()) {
      setError("Escribe el diagnóstico antes de presupuestar.");
      return;
    }

    changeState({
      diagnostico,
      manoObra: Number(manoObra),
      piezas: parts,
      estado: "presupuestada"
    });
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="page-stack">
        <ErrorMessage>{error || "No se encontró la orden."}</ErrorMessage>
        <Link to="/ordenes" className="button button-secondary">Volver a órdenes</Link>
      </div>
    );
  }

  const terminal = ["rechazada", "cancelada", "entregada"].includes(order.estado);
  const photos = Array.isArray(order.fotos) ? order.fotos : [];

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow={`ORDEN #${order.id.slice(0, 8)}`}
        title={order.equipo}
       description={`Registrada el ${formatDate(order.created)}`}
        action={<Link className="button button-ghost" to="/ordenes">← Todas las órdenes</Link>}
      />

      <ErrorMessage>{error}</ErrorMessage>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel order-overview">
            <div className="overview-top">
              <div>
                <span className="muted-label">ESTADO ACTUAL</span>
                <div className="status-large">
                  <StateBadge state={order.estado} />
                </div>
              </div>
              <div className="order-id">
                ID <strong>{order.id}</strong>
              </div>
            </div>

            <div className="overview-data">
              <div>
                <small>Cliente</small>
                <strong>{order.expand?.cliente?.nombre || "—"}</strong>
                <span>{order.expand?.cliente?.telefono || ""}</span>
              </div>
              <div>
                <small>Equipo</small>
                <strong>{order.equipo}</strong>
              </div>
            </div>

            <div className="description-block">
              <small>Problema reportado</small>
              <p>{order.problema}</p>
            </div>

            {photos.length > 0 && (
              <div className="photo-grid">
                {photos.map(photo => (
                  <a
                    href={fileUrl({ ...order, collectionName: "ordenes" }, photo)}
                    target="_blank"
                    rel="noreferrer"
                    key={photo}
                  >
                    <img
                      src={fileUrl({ ...order, collectionName: "ordenes" }, photo)}
                      alt="Fotografía del equipo"
                    />
                  </a>
                ))}
              </div>
            )}
          </section>

          {order.estado === "solicitada" && (
            <section className="panel action-panel">
              <div className="panel-heading">
                <div>
                  <h2>Iniciar revisión</h2>
                  <p>Comienza el diagnóstico del equipo.</p>
                </div>
              </div>
              <button
                className="button button-primary"
                disabled={saving}
                onClick={() => changeState({ estado: "en_diagnostico" })}
              >
                Comenzar diagnóstico →
              </button>
              <button
                className="button button-danger-outline"
                disabled={saving}
                onClick={() => {
                  if (confirm("¿Cancelar esta orden? Esta acción no se puede deshacer.")) {
                    changeState({ estado: "cancelada" });
                  }
                }}
              >
                Cancelar orden
              </button>
            </section>
          )}

          {order.estado === "en_diagnostico" && (
            <section className="panel action-panel">
              <div className="panel-heading">
                <div>
                  <h2>Diagnóstico y presupuesto</h2>
                  <p>Registra el diagnóstico, la mano de obra y las piezas necesarias.</p>
                </div>
              </div>

              <div className="form-stack">
                <label>
                  Diagnóstico
                  <textarea
                    rows="3"
                    value={diagnostico}
                    onChange={e => setDiagnostico(e.target.value)}
                    placeholder="Describe la causa del problema y el trabajo necesario..."
                  />
                </label>

                <label>
                  Mano de obra ($)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manoObra}
                    onChange={e => setManoObra(e.target.value)}
                  />
                </label>

                <div className="parts-heading">
                  <strong>Piezas necesarias</strong>
                  <span>{parts.length} piezas</span>
                </div>

                {parts.map((part, index) => (
                  <div className="part-row" key={`${part.descripcion}-${index}`}>
                    <span>{part.descripcion}</span>
                    <small>{part.cantidad} × {money(part.precio)}</small>
                    <strong>{money(part.cantidad * part.precio)}</strong>
                    <button
                      type="button"
                      className="remove-part"
                      onClick={() => setParts(parts.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <form className="part-form" onSubmit={addPart}>
                  <input
                    required
                    placeholder="Descripción de pieza"
                    value={newPart.descripcion}
                    onChange={e => setNewPart({ ...newPart, descripcion: e.target.value })}
                  />
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    aria-label="Cantidad"
                    value={newPart.cantidad}
                    onChange={e => setNewPart({ ...newPart, cantidad: e.target.value })}
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    aria-label="Precio"
                    value={newPart.precio}
                    onChange={e => setNewPart({ ...newPart, precio: e.target.value })}
                  />
                  <button className="button button-secondary" type="submit">Añadir</button>
                </form>

                <div className="quote-total">
                  <span>Total calculado</span>
                  <strong>{money(quoteTotal(manoObra, parts))}</strong>
                </div>

                <button
                  className="button button-primary"
                  disabled={saving}
                  onClick={saveQuote}
                >
                  {saving ? "Guardando..." : "Guardar presupuesto →"}
                </button>
              </div>
            </section>
          )}

          {order.estado === "presupuestada" && (
            <section className="panel action-panel">
              <div className="panel-heading">
                <div>
                  <h2>Decisión del cliente</h2>
                  <p>Registra la respuesta al presupuesto.</p>
                </div>
              </div>
              <div className="decision-actions">
                <button
                  className="button button-primary"
                  disabled={saving}
                  onClick={() => changeState({ estado: "aprobada" })}
                >
                  ✓ Presupuesto aceptado
                </button>
                <button
                  className="button button-danger-outline"
                  disabled={saving}
                  onClick={() => changeState({ estado: "rechazada" })}
                >
                  ✕ Presupuesto rechazado
                </button>
              </div>
            </section>
          )}

          {["aprobada", "en_reparacion", "lista"].includes(order.estado) && (
            <section className="panel action-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    {order.estado === "aprobada"
                      ? "Iniciar reparación"
                      : order.estado === "en_reparacion"
                        ? "Finalizar reparación"
                        : "Entregar equipo"}
                  </h2>
                  <p>
                    {order.estado === "aprobada"
                      ? "El cliente aceptó el presupuesto. Puedes comenzar."
                      : order.estado === "en_reparacion"
                        ? "Confirma que el trabajo de reparación ha terminado."
                        : "Registra que el equipo fue devuelto al cliente."}
                  </p>
                </div>
              </div>
              <button
                className="button button-primary"
                disabled={saving}
                onClick={() => changeState({ estado: nextState[order.estado] })}
              >
                {order.estado === "aprobada"
                  ? "Comenzar reparación →"
                  : order.estado === "en_reparacion"
                    ? "Marcar como lista →"
                    : "Confirmar entrega →"}
              </button>
            </section>
          )}

          {order.estado !== "solicitada" && order.diagnostico && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Diagnóstico y presupuesto</h2>
                  <p>Información registrada al presupuestar</p>
                </div>
              </div>

              <p className="diagnosis-text">{order.diagnostico}</p>

              <div className="quote-line">
                <span>Mano de obra</span>
                <strong>{money(order.manoObra)}</strong>
              </div>

              {(order.piezas || []).map((p, i) => (
                <div className="quote-line" key={i}>
                  <span>{p.descripcion} ({p.cantidad} × {money(p.precio)})</span>
                  <strong>{money(p.cantidad * p.precio)}</strong>
                </div>
              ))}

              <div className="quote-total">
                <span>Total</span>
                <strong>{money(quoteTotal(order.manoObra, order.piezas || []))}</strong>
              </div>
            </section>
          )}
        </div>

        <aside className="panel timeline-panel">
          <div className="panel-heading">
            <div>
              <h2>Historial</h2>
              <p>Movimientos de esta orden</p>
            </div>
          </div>

          {events.length ? (
            <div className="timeline">
              {events.map(event => (
                <div className="timeline-item" key={event.id}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{STATE_LABELS[event.a] || event.a}</strong>
                    <small>{STATE_LABELS[event.de] || event.de} → {STATE_LABELS[event.a] || event.a}</small>
                    <time>{formatDate(event.created)}</time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">Los cambios de etapa aparecerán aquí.</p>
          )}

          {terminal && (
            <div className="closed-note">
              Esta orden está cerrada y no admite más cambios.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
