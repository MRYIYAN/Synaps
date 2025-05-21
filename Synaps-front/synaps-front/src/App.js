import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak, { keycloakInitOptions } from "./keycloak";


// ---------------------------------------------
// Importamos las páginas de la aplicación
// ---------------------------------------------

import Landing        from "./pages/LandingPage";
import Register       from "./pages/RegisterPage";
import Login          from "./pages/LoginPage";

import Home           from "./pages/HomePage";
import Notes          from "./pages/NotesPage";
import MarkdownEditor from "./pages/MarkdownEditorPage";
import GalaxyView     from "./pages/GalaxyViewPage";
import Todo           from "./pages/TodoPage";
import Journal        from "./pages/JournalPage";
import Settings       from "./pages/SettingsPage";

// ---------------------------------------------
// Importamos el css global de la aplicación
// ---------------------------------------------
import './assets/styles/global.css';
// ---------------------------------------------


function App() {
  return (
    
    // Añadimos la capa del Keycloack con la configuración definida para evitar peticiones sin autentificar
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={keycloakInitOptions}
    >

      {/* Enrutador */}
      <BrowserRouter>
        <Routes>
          
          {/* --------------------------------------------------------------- */}
          {/* Rutas de la parte de la Landing */}
          {/* --------------------------------------------------------------- */}
          <Route path="/"                 element={<Landing         />} />
          <Route path="/landing"          element={<Landing         />} /> 
          <Route path="/register"         element={<Register        />} />
          <Route path="/login"            element={<Login           />} />

          {/* --------------------------------------------------------------- */}
          {/* Aplicación */}
          {/* --------------------------------------------------------------- */}
          <Route path="/home"             element={<Home            />} />
          <Route path="/notes"            element={<Notes           />} />
          <Route path="/markdowneditor"   element={<MarkdownEditor  />} />
          <Route path="/galaxyview"       element={<GalaxyView      />} />
          <Route path="/todo"             element={<Todo            />} />
          <Route path="/journal"          element={<Journal         />} />
          <Route path="/settings"         element={<Settings        />} />
          
        </Routes>
      </BrowserRouter>
    </ReactKeycloakProvider>
  );
}

export default App;
