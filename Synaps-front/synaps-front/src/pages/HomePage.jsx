import React, { useEffect, useState } from "react";

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

/*
import Button     from "../components/Button";
import Card       from "../components/Card";
import LoginForm  from "../components/LoginForm";
import Modal      from "../components/Modal";
*/

import SidebarPanel from "../components/SidebarPanel";

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const Home = function() {

  // HTML del formulario
  return (
    <div style={{ padding: "2rem" }}>
      <SidebarPanel />
    </div>
  );
}

export default Home;
