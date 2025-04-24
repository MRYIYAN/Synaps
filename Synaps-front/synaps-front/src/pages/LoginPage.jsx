import React, { useEffect, useState } from 'react';

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

/*
import Button     from '../components/Button';
import Card       from '../components/Card';
import Modal      from '../components/Modal';
*/

import LoginForm  from '../components/LoginForm';

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const LoginPage = function() {
  
  // Inicializamos las variables utilizadas en el DOM
  const [message, set_message] = useState( 'Cargando...' );

  useEffect(() => {
    fetch("http://localhost:8010/api/hello", { method: "GET" })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar mensaje");
        return res.json();
      })
      .then(data => {
        set_message(data.message || "Sin mensaje");
      })
      .catch(() => {
        set_message("No se pudo conectar al servidor");
      });
  }, []);

  // HTML del formulario
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Frontend React</h1>
      <h2>Respuesta desde el backend para:</h2>
      <p>{message}</p>

      <hr/>

      <LoginForm />
    </div>
  );
}

export default LoginPage;
