onRecordUpdate((e) => {
  const oldRecord = e.record.original();
  const oldState = oldRecord.getString("estado");
  const newState = e.record.getString("estado");

  if (oldState === newState) {
    e.next();
    return;
  }

  if (oldState === "solicitada") {
    if (newState !== "en_diagnostico" && newState !== "cancelada") {
      throw new BadRequestError("Transición no permitida.");
    }
  } else if (oldState === "en_diagnostico") {
    if (newState !== "presupuestada") {
      throw new BadRequestError("Transición no permitida.");
    }
  } else if (oldState === "presupuestada") {
    if (newState !== "aprobada" && newState !== "rechazada") {
      throw new BadRequestError("Transición no permitida.");
    }
  } else if (oldState === "aprobada") {
    if (newState !== "en_reparacion") {
      throw new BadRequestError("Transición no permitida.");
    }
  } else if (oldState === "en_reparacion") {
    if (newState !== "lista") {
      throw new BadRequestError("Transición no permitida.");
    }
  } else if (oldState === "lista") {
    if (newState !== "entregada") {
      throw new BadRequestError("Transición no permitida.");
    }
  } else {
    throw new BadRequestError("Esta orden ya no admite cambios de estado.");
  }

  e.next();
}, "ordenes");