import { Link, useParams } from 'react-router-dom';
import './StoreLegal.css';

const LEGAL_CONTENT: Record<string, { title: string; body: string }> = {
  terminos: {
    title: 'Términos y condiciones',
    body:
      'El uso de la tienda MEGA CEL implica la aceptación de nuestras condiciones de compra, garantías y políticas de atención. El contenido legal completo estará disponible próximamente.',
  },
  privacidad: {
    title: 'Política de privacidad',
    body:
      'En MEGA CEL protegemos tus datos personales utilizados para pedidos, entregas y comunicación comercial. La política detallada estará disponible próximamente.',
  },
  envios: {
    title: 'Política de envíos',
    body:
      'Realizamos entregas en Puerto Maldonado y zonas acordadas con el cliente. Los plazos y costos se confirman al coordinar cada pedido. La política completa estará disponible próximamente.',
  },
};

export const StoreLegal = () => {
  const { section } = useParams<{ section: string }>();
  const content = section ? LEGAL_CONTENT[section] : undefined;

  if (!content) {
    return (
      <div className="store-legal">
        <div className="store-container store-legal__inner">
          <h1>Página no encontrada</h1>
          <Link to="/" className="store-legal__back">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="store-legal">
      <div className="store-container store-legal__inner">
        <Link to="/" className="store-legal__back">
          ← Volver al inicio
        </Link>
        <h1>{content.title}</h1>
        <p>{content.body}</p>
      </div>
    </div>
  );
};
