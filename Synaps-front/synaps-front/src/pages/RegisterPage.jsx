import React, { useEffect, useState } from 'react';

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

/*
import Button     from '../components/Button';
import Card       from '../components/Card';
import Modal      from '../components/Modal';
*/

import RegisterForm  from '../components/RegisterForm';

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const RegisterPage = function() {
  
  // Inicializamos las variables utilizadas en el DOM
  const [message, set_message] = useState( 'Cargando...' );

  // HTML del formulario
  return (
    <div>
      <h1>Frontend React</h1>
      <h2>Respuesta desde el backend para:</h2>
      <p>{message}</p>

      <hr/>

      <RegisterForm />
    </div>
  );
}

export default RegisterPage;
