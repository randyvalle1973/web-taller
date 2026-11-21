migrate((app) => {
  const clientes = new Collection({
    type: "base",
    name: "clientes",
    fields: [
      { name: "nombre", type: "text", required: true, max: 120 },
     {
  name: "telefono",
  type: "text",
  required: true,
  min: 8,
  max: 8,
  pattern: "^\\d{8}$"
}
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null
  });
  app.save(clientes);

  const ordenes = new Collection({
    type: "base",
    name: "ordenes",
    fields: [
      { name: "cliente", type: "relation", required: true, collectionId: clientes.id, maxSelect: 1, cascadeDelete: false },
      { name: "equipo", type: "text", required: true, max: 160 },
      { name: "problema", type: "text", required: true, max: 3000 },
      { name: "estado", type: "select", required: true, maxSelect: 1, values: ["solicitada", "en_diagnostico", "presupuestada", "aprobada", "rechazada", "en_reparacion", "lista", "entregada", "cancelada"] },
      { name: "diagnostico", type: "text", max: 5000 },
      { name: "manoObra", type: "number", min: 0 },
      { name: "piezas", type: "json" },
      { name: "fotos", type: "file", maxSelect: 3, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp"] }
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null
  });
  app.save(ordenes);

  const eventos = new Collection({
    type: "base",
    name: "eventos",
    fields: [
      { name: "orden", type: "relation", required: true, collectionId: ordenes.id, maxSelect: 1, cascadeDelete: false },
      { name: "de", type: "text", required: true, max: 40 },
      { name: "a", type: "text", required: true, max: 40 }
    ],
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null
  });
  app.save(eventos);
}, (app) => {
  ["eventos", "ordenes", "clientes"].forEach(name => {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (_) {}
  });
});