import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { createRecord, listRecords } from "../lib/pocketbase";
import { ErrorMessage, Loading, PageHeading } from "../components/UI";

export default function NewOrder() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ cliente: "", equipo: "", problema: "" });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let active = true;
    listRecords("clientes", { sort: "nombre" }).then(data => { if (active) setClients(data.items || []); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const submit = async e => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("estado", "solicitada");
      photos.slice(0, 3).forEach(file => body.append("fotos", file));
      const record = await createRecord("ordenes", body);
      navigate(`/ordenes/${record.id}`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  return <div className="page-stack narrow-page">
    <PageHeading eyebrow="NUEVO REGISTRO" title="Registrar equipo" description="Crea una orden para iniciar el seguimiento de una reparación." action={<Link className="button button-ghost" to="/ordenes">← Volver</Link>} />
    <ErrorMessage>{error}</ErrorMessage>
    {!clients.length && <div className="alert alert-info">Primero debes registrar un cliente para poder crear una orden. <Link to="/clientes">Ir a clientes →</Link></div>}
    <section className="panel">
      <form onSubmit={submit} className="form-stack">
        <div className="form-section-title"><span>01</span><div><strong>Información del cliente</strong><small>¿Quién trae el equipo?</small></div></div>
        <label>Cliente<select required value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })}><option value="">Selecciona un cliente</option>{clients.map(c => <option key={c.id} value={c.id}>{c.nombre} · {c.telefono}</option>)}</select></label>
        <div className="form-section-title"><span>02</span><div><strong>Información del equipo</strong><small>Identifica el dispositivo y su problema</small></div></div>
        <label>Equipo<input required maxLength="160" value={form.equipo} onChange={e => setForm({ ...form, equipo: e.target.value })} placeholder="Ej. Laptop HP Pavilion 15" /></label>
        <label>Descripción del problema<textarea required rows="4" maxLength="3000" value={form.problema} onChange={e => setForm({ ...form, problema: e.target.value })} placeholder="Describe los síntomas que reporta el cliente..." /></label>
        <label>Fotografías del equipo <span className="optional-label">Opcional · máximo 3 imágenes</span><input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files || []).slice(0, 3))} /></label>
        {photos.length > 0 && <div className="file-summary">{photos.map(f => <span key={`${f.name}-${f.size}`}>▧ {f.name}</span>)}</div>}
        <div className="form-footer"><span>La orden se creará en estado <strong>Solicitada</strong>.</span><button className="button button-primary" disabled={saving || !clients.length}>{saving ? "Creando orden..." : "Crear orden →"}</button></div>
      </form>
    </section>
  </div>;
}