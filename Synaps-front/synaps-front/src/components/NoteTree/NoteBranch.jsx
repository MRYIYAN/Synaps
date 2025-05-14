/**
 * @file NoteBranch.jsx
 * @description Renderiza recursivamente un nivel del árbol de notas.
 *
 * @param {Object} props
 * @param {Object} props.node         Nodo actual con posibles hijos
 * @param {number} props.depth        Nivel de profundidad (0-base)
 * @param {string} props.selectedId2  ID2 del nodo actualmente seleccionado
 */

import React, { useState } from "react";
import NoteItem from "./NoteItem";
import styles from "./NoteTree.css";

export default function NoteBranch({ node, depth, selectedId2 }) {

  // Estado para controlar si está colapsado
  const [collapsed, setCollapsed] = useState( false );

  // Comprueba si este nodo tiene hijos
  const hasChildren = ( node.type === 'folder' );

  // Alterna colapso/expansión únicamente si hay hijos
  const handleToggle = e => {
    e.stopPropagation();
    hasChildren && setCollapsed( prev => !prev );
  };

  return (
    <div className="node-branch" role="group" aria-labelledby={node.id2}>
      <NoteItem
        id2={node.id2}
        title={node.title}
        depth={depth}
        hasChildren={hasChildren}
        collapsed={collapsed}
        selected={node.id2 === selectedId2}
        onToggle={handleToggle}
      />  

      {/* Si no está colapsado y tiene hijos, renderiza recursivamente */}
      {hasChildren === false ? (
        <div className={`node-branch ${collapsed ? 'collapsed' : ''}`}>
          {node.children.map( ( child ) => (
            <NoteBranch
              className="node-branch"
              key={child.id2}
              node={child}
              depth={depth + 1.25}
              selectedId2={selectedId2}
            />
          ) )}
        </div>
      ) : '' }
    </div>
  );
}