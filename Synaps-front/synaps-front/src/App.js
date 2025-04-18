import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm"; // Importamos el compoente LoginForm

function App() {
  const [message, set_message] = useState("Cargando...");

  useEffect(() => {
    fetch("http://localhost:8010/api/hello")
      .then((res) => res.json())
      .then((data) => set_message(data.message))
      .catch(() => set_message("Error al conectar con el backend"));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Frontend React</h1>
      <h2>Respuesta desde el backend para:</h2>
      <p>{message}</p>

      <hr/>

      {/* Aquí mostramos el formulario de login (se carga dinamicamente) */}
      <LoginForm />
    </div>
  );
}

export default App;
