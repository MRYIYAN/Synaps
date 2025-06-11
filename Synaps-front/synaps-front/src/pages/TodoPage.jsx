import React, { useEffect, useState } from "react";
import SidebarPanel from "../components/SidebarPanel";
import ListTodoPanel from "../components/Atomic/Panels/ListTodoPanel";

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

/*
import Button     from "../components/Button";
import Card       from "../components/Card";
import LoginForm  from "../components/LoginForm";
import Modal      from "../components/Modal";
*/

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const Todo = function() {

  // HTML del formulario
  return (
    <div className="app-layout">
      <SidebarPanel defaultSelectedItem="list-todo" />
      <main className="main-content">
        {/* Aquí mostramos el tablero Kanban completo */}
        <ListTodoPanel viewType="kanban" />
      </main>
    </div>
  );
}

export default Todo;
