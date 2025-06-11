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

export const PanelRefContext = React.createContext( null );

/**
 * Construye un árbol jerárquico a partir de una lista plana.
 *
 * @param {Array} items - Lista de elementos con claves 'id2' y 'parent_id'.
 * @param {string|null} parent_id - ID del elemento padre actual (por defecto, 0).
 * @param {Set} visited - Set de IDs visitados para evitar recursión infinita.
 * @returns {Array} Árbol de elementos con hijos anidados.
 */
function buildTree( items, parent_id = 0, visited = new Set() ) {
  // Verificar que items sea un array válido
  if( !Array.isArray( items ) ) {
    console.warn( 'buildTree: items no es un array válido', items );
    return [];
  }

  // Filtrar elementos que tengan el parent_id correcto
  const children = items.filter( item => {
    // Verificar que el item tenga las propiedades necesarias
    if( !item || typeof item !== 'object' ) {
      return false;
    }
    
    // Verificar que tenga id2 y parent_id
    if( !item.hasOwnProperty( 'id2' ) || !item.hasOwnProperty( 'parent_id' ) ) {
      return false;
    }

    // Convertir parent_id a número para comparación
    const itemParentId = parseInt( item.parent_id, 10 );
    const targetParentId = parseInt( parent_id, 10 );
    
    return itemParentId === targetParentId;
  } );

  return children.map( item => {
    // Verificar si ya hemos visitado este nodo para evitar recursión infinita
    if( visited.has( item.id2 ) ) {
      console.warn( 'buildTree: Recursión circular detectada para', item.id2 );
      return {
        ...item,
        children: []
      };
    }

    // Agregar el ID actual al conjunto de visitados
    const newVisited = new Set( visited );
    newVisited.add( item.id2 );

    // Solo construir hijos para carpetas
    const hasChildren = item.type === 'folder';
    
    return {
      ...item,
      children: hasChildren ? buildTree( items, item.id, newVisited ) : []
    };
  } );
}


export default function NoteTree( { nodes = [] } ) {
  const panelRef = useRef();

  // Validar que nodes sea un array válido
  const validNodes = Array.isArray( nodes ) ? nodes : [];
  
  // Agregar logging para debug
  if( validNodes.length > 0 ) {
    console.log( 'NoteTree recibió nodes:', validNodes );
  }

  // Construir el árbol con validación adicional
  let treeData = [];
  try {
    treeData = buildTree( validNodes, 0 );
  } catch( error ) {
    console.error( 'Error construyendo árbol:', error );
    treeData = [];
  }

  return (
    <PanelRefContext.Provider value={panelRef}>
      <div className={"node-tree"} ref={panelRef} role="tree">
        {treeData.map( ( item ) => {
          // Verificar que el item tenga id2 válido
          if( !item || !item.id2 ) {
            console.warn( 'Item sin id2 válido:', item );
            return null;
          }
          
          return (
            <NoteBranch
              key={item.id2}
              node={item}
              depth={1}
            />
          );
        } ).filter( Boolean )}
      </div>
    </PanelRefContext.Provider>
  );
}