/**
 * @file NoteTree.jsx
 * @description Renderiza el árbol de notas.
 *
 * @param {Object}   props
 * @param {Array}    props.nodes        Lista plana de notas
 * @param {string=}  props.selectedId2  Identificador seleccionado
 */

import React, { useRef } from "react";
import NoteBranch from "./NoteBranch";
import styles from "./NoteTree.css";

export const PanelRefContext = React.createContext( null );

/**
 * Construye un árbol jerárquico a partir de una lista plana.
 *
 * @param {Array} items - Lista de elementos con claves 'id2' y 'parent_id'.
 * @param {string|null} parent_id - ID2 del elemento padre actual (por defecto, null).
 * @returns {Array} Árbol de elementos con hijos anidados.
 */
function buildTree( items, parent_id = 0 ) {
  return items
    .filter( item => item.parent_id === parent_id )
    .map( item => ( {
      ...item,
      children: item.type === 'folder' ? buildTree( items, item.id ) : []
    } ) );
}


export default function NoteTree( { nodes = [] } ) {
  const treeData = buildTree( nodes, 0 );

  const panelRef = useRef();

  return (
    <PanelRefContext.Provider value={panelRef}>
      <div className={"node-tree"} ref={panelRef} role="tree">
        {treeData.map( ( item ) => (
          <NoteBranch
            key={item.id2}
            node={item}
            depth={1}
          />
        ) ) }
      </div>
    </PanelRefContext.Provider>
  );
}