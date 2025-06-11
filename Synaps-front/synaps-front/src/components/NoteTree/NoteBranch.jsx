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

// Estado global para mantener el estado de expansión de las carpetas
if(!window.expandedFolders) {
  window.expandedFolders = new Set();
}

export default function NoteBranch({ node, depth, selectedId2 }) {

  // Usar directamente el estado global para determinar si está expandido
  const isExpanded = window.expandedFolders.has(node.id2);
  
  // Estado local solo para forzar re-render cuando cambie el estado global
  const [, forceUpdate] = useState(0);

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
    if(isExpanded) {
      window.expandedFolders.delete(node.id2);
    } else {
      window.expandedFolders.add(node.id2);
    }
    // Forzar re-render
    forceUpdate(prev => prev + 1);
  }

  return (
    <div className="node-branch" role="group" aria-labelledby={node.id2}>
      <NoteItem
        id={node.id}
        id2={node.id2}
        title={node.title}
        depth={depth}
        hasChildren={hasChildren}
        collapsed={!isExpanded}
        selected={node.id2 === window.selectedItemId2}
        onToggle={handleToggle}
      />  

      {/* Si no está colapsado y tiene hijos, renderiza recursivamente */}
      {hasChildren && isExpanded && validChildren.length > 0 && (
        <div className={`node-branch ${!isExpanded ? 'collapsed' : ''}`}>
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