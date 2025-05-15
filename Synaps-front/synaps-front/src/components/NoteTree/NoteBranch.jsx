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
      />  

      {/* Si no está colapsado y tiene hijos, renderiza recursivamente */}
      {hasChildren && !collapsed && node.children.length > 0 && (
        <div className={`node-branch ${collapsed ? 'collapsed' : ''}`}>
          {node.children.map( ( child ) => (
            <NoteBranch
              className="node-branch"
              key={child.id2}
              node={child}
              depth={depth + 1.25}
            />
          ) )}
        </div>
      )}
    </div>
  );
}