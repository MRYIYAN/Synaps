/**
 * @file NoteItem.jsx
 * @description Representa un nodo del árbol de notas con icono condicional.
 *
 * @param {Object}   props
 * @param {string}   props.id2         Identificador único de la nota
 * @param {string}   props.title       Título de la nota
 * @param {number}   props.depth       Nivel de profundidad (0-base)
 * @param {boolean}  props.hasChildren Indica si el nodo tiene hijos
 * @param {boolean}  props.collapsed   Indica si el nodo está colapsado
 * @param {boolean}  props.selected    Indica si el nodo está seleccionado
 * @param {Function} props.onToggle    Función para expandir/colapsar
 */

import React, { useState, useRef } from "react";
import styles from "./NoteTree.css";
import ContextMenu from "../Atomic/Menu/ContextMenu";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as FileIcon }   from "../../assets/icons/file.svg";

export default function NoteItem( {
  id,
  id2,
  title,
  depth,
  hasChildren,
  collapsed,
  selected,
  onToggle,
} ) {

  // Estado para menú contextual
  const [menuPos, setMenuPos] = useState({ x: null, y: null });
  const [menuOptions, setMenuOptions] = useState([]);

  // Función para manejar los eventos de los items
  function handleClick() {

    // Seleccionamos el item
    window.setSelectedItemId( id );
    window.setSelectedItemId2( id2 );

    // Solo si es una carpeta, recargamos las notas filtradas por ese folder_id
    if(
      typeof window.getNotesForFolder === 'function' &&
      typeof window.readNote          === 'function'
    ) {

      // Recuperamos el item completo desde el árbol si es necesario
      const item = { id2, title, type: hasChildren ? 'folder' : 'note' }; // o lo pasas como prop

      // Busca el elemento con id2 y extrae su id numérico
      const id = window.currentNotes?.find( i => i.id2 === id2 )?.id;

      // Si existe, llama a getNotesForFolder(id) para carpetas o readNote(id) para notas
      if( id ) ( item.type === 'folder'
        ? window.getNotesForFolder
        : window.readNote 
      )( id );
    }

    // Toggle de expansión si es folder
    if( hasChildren && typeof onToggle === 'function' )
      onToggle();
  }

  // Menú contextual: muestra con click derecho
  function handleContextMenu( e ) {
    e.preventDefault();

    setMenuOptions( [
      { label: 'Eliminar', onClick: () => alert( 'Eliminar: ' + title ) },

      /*
      { label: 'Renombrar', onClick: () => alert('Renombrar: ' + title) },
      { divider: true },
      { label: hasChildren ? 'Nueva nota' : 'Duplicar', onClick: () => alert('Acción especial sobre: ' + title) },
      */
    ] );

    setMenuPos( { x: e.clientX, y: e.clientY } );
  }

  function closeMenu() {
    setMenuPos( { x: null, y: null } );
  }

  // Sangrado según la profundidad
  const indentStyle = { paddingLeft: `${depth * 16}px` };

  return (
    <div
      className={`node-item ${selected ? "selected" : ""}`}
      role="treeitem"
      aria-expanded={hasChildren ? !collapsed : undefined}
      aria-selected={selected}
      id={id2}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={indentStyle}
    >
      {/* Muestra icono de carpeta si tiene hijos, de archivo si no */}
      {hasChildren
        ? <FolderIcon className={"node-tree-icon"} aria-label={collapsed ? "Expandir" : "Colapsar"} />
        : <FileIcon className={"node-tree-icon"} aria-hidden="true" />
      }

      {/* Título de la nota */}
      <span className={styles.title}>{title}</span>
      <ContextMenu
        options={menuOptions}
        x={menuPos.x - 50}
        y={menuPos.y}
        onClose={closeMenu}
      />
    </div>
  );
}