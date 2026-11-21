
migrate((app) => {
  const nombres = ["clientes", "ordenes", "eventos"];

  nombres.forEach((nombre) => {
    const collection = app.findCollectionByNameOrId(nombre);

    collection.fields.add(new AutodateField({
      name: "created",
      onCreate: true,
      onUpdate: false
    }));

    collection.fields.add(new AutodateField({
      name: "updated",
      onCreate: true,
      onUpdate: true
    }));

    app.save(collection);
  });
}, (app) => {
  const nombres = ["clientes", "ordenes", "eventos"];

  nombres.forEach((nombre) => {
    const collection = app.findCollectionByNameOrId(nombre);

    collection.fields.removeByName("created");
    collection.fields.removeByName("updated");

    app.save(collection);
  });
});
