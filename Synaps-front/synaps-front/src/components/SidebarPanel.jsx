import React from "react";
import "../assets/styles/SidebarPanel.css";

import { ReactComponent as SearchIcon } from "../assets/icons/search.svg";
import { ReactComponent as FoldersIcon } from "../assets/icons/folders.svg";
import { ReactComponent as ListTodoIcon } from "../assets/icons/list-todo.svg";
import { ReactComponent as WaypointsIcon } from "../assets/icons/waypoints.svg";
import { ReactComponent as LockIcon } from "../assets/icons/lock.svg";

function SidebarPanel() {
    return (
        <div className="sidebar_container">
            <div className="sidebar_static">
                {/* Botón de "Buscar" */}
                <button className="sidebar_button">
                    <pixel-canvas data-gap="6" data-speed="35"></pixel-canvas>
                    <SearchIcon className="icon" />
                </button>

                {/* Botón de "Mis Proyectos" */}
                <button className="sidebar_button">
                    <pixel-canvas data-gap="6" data-speed="35"></pixel-canvas>
                    <FoldersIcon className="icon" />
                </button>

                {/* Botón de "Mis Tareas" */}
                <button className="sidebar_button">
                    <pixel-canvas data-gap="6" data-speed="35"></pixel-canvas>
                    <ListTodoIcon className="icon" />
                </button>

                {/* Botón de "Vista de Galaxia" */}
                <button className="sidebar_button">
                    <pixel-canvas data-gap="6" data-speed="35"></pixel-canvas>
                    <WaypointsIcon className="icon" />
                </button>

                {/* Botón de "Notas Personales" */}
                <button className="sidebar_button">
                    <pixel-canvas data-gap="6" data-speed="35"></pixel-canvas>
                    <LockIcon className="icon" />
                </button>
            </div>
        </div>
    );
}

export default SidebarPanel;


