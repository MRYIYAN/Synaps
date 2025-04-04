import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Cargando...");

  useEffect(() => {
      fetch("http://localhost:8010/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("Error al conectar con el backend 😢"));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Frontend React 🟦</h1>
      <h2>Respuesta desde Laravel 🟨:</h2>
      <p>{message}</p>
    </div>
  );
}
export default App;
