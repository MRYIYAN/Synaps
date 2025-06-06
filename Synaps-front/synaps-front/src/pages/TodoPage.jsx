import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import SidebarPanel from "../components/SidebarPanel";
import TasksPanel from "../components/Atomic/Panels/TasksPanel";
import "../assets/styles/TodoPage.css";

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const Todo = function() {
  const location = useLocation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Leer parámetros de la URL usando useLocation de React Router
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    const action = params.get('action');

    if (filter) {
      setSelectedFilter(filter);
    }

    if (action === 'create') {
      setShowCreateModal(true);
    }
  }, [location.search]); // Dependencia en location.search para reaccionar a cambios en la URL

  // HTML del componente
  return (
    <div className="todo-page">
      <SidebarPanel />      <div className="todo-main-content">
        <TasksPanel 
          initialFilter={selectedFilter} 
          showModal={showCreateModal}
          onCloseModal={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
}

export default Todo;
