
import { useEffect, useState } from "react";
import { createRecord, listRecords } from "../lib/pocketbase";
import {
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeading
} from "../components/UI";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: ""
  });
  const [search, setSearch] = useState("");

  const refresh = async () => {
    const [clientsResult, ordersResult] = await Promise.allSettled([
      listRecords("clientes"),
      listRecords("ordenes")
    ]);

    if (clientsResult.status === "rejected") {
      throw clientsResult.reason;
    }

    setClients(clientsResult.value.items || []);

    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value.items || []);
    } else {
      setOrders([]);
      setError(
        "Los clientes se cargaron, pero no se pudieron consultar las órdenes: " +
        ordersResult.reason.message
      );
    }
  };

  useEffect(() => {
    let active = true;

    const loadClients = async () => {
      try {
        await refresh();
      } catch (e) {
        if (active) {
          setError(e.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      active = false;
    };
  }, []);

  const submit = async e => {
    e.preventDefault();
    setError("");

    if (!/^\d{8}$/.test(form.telefono)) {
      setError("El teléfono debe tener exactamente 8 dígitos numéricos.");
      return;
    }

    setSaving(true);

    try {
      await createRecord("clientes", {
        nombre: form.nombre.trim(),
        telefono: form.telefono
      });

      setForm({
        nombre: "",
        telefono: ""
      });

      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter(client =>
    `${client.nombre} ${client.telefono}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="DIRECTORIO"
        title="Clientes"
        description="Administra los datos de las personas que confían en tu taller."
      />

      <ErrorMessage>{error}</ErrorMessage>

      <div className="content-two-col">
        <section className="panel form-panel">
          <div className="panel-heading">
            <div>
              <h2>Nuevo cliente</h2>
              <p>Registra los datos de contacto</p>
            </div>
            <span className="panel-icon">＋</span>
          </div>

          <form onSubmit={submit} className="form-stack">
            <label>
              Nombre completo
              <input
                required
                maxLength="120"
                value={form.nombre}
                onChange={e =>
                  setForm({
                    ...form,
                    nombre: e.target.value
                  })
                }
                placeholder="Ej. María Rodríguez"
              />
            </label>

            <label>
              Teléfono
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength="8"
                value={form.telefono}
                onChange={e =>
                  setForm({
                    ...form,
                    telefono: e.target.value.replace(/\D/g, "").slice(0, 8)
                  })
                }
                placeholder="Ej. 55512345"
              />
            </label>

            <button
              className="button button-primary button-full"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cliente"}
            </button>
          </form>
        </section>

        <section className="panel directory-panel">
          <div className="panel-heading">
            <div>
              <h2>Directorio de clientes</h2>
              <p>{clients.length} clientes registrados</p>
            </div>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
            />
          </div>

          {filtered.length ? (
            <div className="client-list">
              {filtered.map(client => (
                <div className="client-row" key={client.id}>
                  <div className="client-avatar">
                    {client.nombre?.charAt(0)?.toUpperCase()}
                  </div>

                  <div className="client-info">
                    <strong>{client.nombre}</strong>
                    <small>{client.telefono}</small>
                  </div>

                  <span className="client-orders">
                    {orders.filter(order => order.cliente === client.id).length} órdenes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                clients.length
                  ? "No se encontraron clientes"
                  : "No hay clientes registrados"
              }
              description={
                clients.length
                  ? "Prueba con otro término de búsqueda."
                  : "Registra un cliente nuevo para comenzar."
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
