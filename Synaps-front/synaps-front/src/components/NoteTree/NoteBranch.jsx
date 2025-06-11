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

  // Estado para controlar si está colapsado - iniciamos colapsado
  const [collapsed, setCollapsed] = useState( true );

  // Validar que node sea un objeto válido
  if( !node || typeof node !== 'object' || !node.id2 ) {
    console.warn( 'NoteBranch: node inválido', node );
    return null;
  }

  // Comprueba si este nodo tiene hijos
  const hasChildren = ( node.type === 'folder' );

  // Validar que children sea un array
  const validChildren = Array.isArray( node.children ) ? node.children : [];

  // Callback para alternar estado colapsado (se pasa al hijo)
  function handleToggle() {
    setCollapsed( ( collapsed ) => !collapsed );
  }

  return (
    <div className="node-branch" role="group" aria-labelledby={node.id2}>
      <NoteItem
        id={node.id}
        id2={node.id2}
        title={node.title}
        depth={depth}
        hasChildren={hasChildren}
        collapsed={collapsed}
        selected={node.id2 === window.selectedItemId2}
        onToggle={handleToggle}
      />  

      {/* Si no está colapsado y tiene hijos, renderiza recursivamente */}
      {hasChildren && !collapsed && validChildren.length > 0 && (
        <div className={`node-branch ${collapsed ? 'collapsed' : ''}`}>
          {validChildren.map( ( child ) => {
            // Verificar que cada hijo tenga id2 válido
            if( !child || !child.id2 ) {
              console.warn( 'NoteBranch: child sin id2 válido', child );
              return null;
            }

            return (
              <NoteBranch
                className="node-branch"
                key={child.id2}
                node={child}
                depth={depth + 1.25}
              />
            );
          } ).filter( Boolean )}
        </div>
      )}
    </div>
  );
}