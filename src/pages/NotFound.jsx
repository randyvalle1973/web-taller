import { Link } from "react-router";
export default function NotFound() {
  return <div className="not-found"><div>404</div><h1>Página no encontrada</h1><p>La sección que buscas no existe o ha cambiado de dirección.</p><Link className="button button-primary" to="/">Volver al resumen</Link></div>;
}