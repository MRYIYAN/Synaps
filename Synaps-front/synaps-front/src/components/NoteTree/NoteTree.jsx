/**
 * @file NoteTree.jsx
 * @description Renderiza el árbol de notas.
 *
 * @param {Object}   props
 * @param {Array}    props.nodes        Lista plana de notas
 * @param {string=}  props.selectedId2  Identificador seleccionado
 */

import React from "react";
import NoteBranch from "./NoteBranch";
import styles from "./NoteTree.css";

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
      children: buildTree( items, item.id2 )
    } ) );
}


export default function NoteTree( { nodes = [], selectedId2 = null } ) {
  const treeData = buildTree( nodes, 0 );

  return (
    <div className={"node-tree"} role="tree">
      {treeData.map( ( item ) => (
        <NoteBranch
          key={item.id2}
          node={item}
          depth={1}
          selectedId2={selectedId2}
        />
      ) ) }
    </div>
  );
}