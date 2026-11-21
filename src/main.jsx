import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clients from "./pages/Clients.jsx";
import Orders from "./pages/Orders.jsx";
import NewOrder from "./pages/NewOrder.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="ordenes" element={<Orders />} />
          <Route path="ordenes/nueva" element={<NewOrder />} />
          <Route path="ordenes/:id" element={<OrderDetail />} />
          <Route path="ajustes" element={<Settings />} />
          <Route path="inicio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);