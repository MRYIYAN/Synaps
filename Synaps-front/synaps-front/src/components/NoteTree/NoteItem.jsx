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
 */

import React, { useState, useContext } from "react";
import { PanelRefContext } from "./NoteTree";

import styles from "./NoteTree.css";
import ContextMenu from "../Atomic/Menu/ContextMenu";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as FileIcon }   from "../../assets/icons/file.svg";
import ConfirmationModal from '../Atomic/Modal/ConfirmationModal';

export default function NoteItem( {
  id,
  id2,
  title,
  depth,
  hasChildren,
  collapsed,
  selected,
  onToggle
} ) {

  // Estado para menú contextual
  const [menuPos, setMenuPos] = useState( { x: null, y: null } );
  const [menuOptions, setMenuOptions] = useState( [] );
  const [isConfirmOpen, setIsConfirmOpen] = useState( false );

  // Capturamos la referencia del Panel
  const panelRef = useContext( PanelRefContext );

  // -----------------------------------------------------------------
  // Modal
  // -----------------------------------------------------------------
  
  // Lógica para confirmar o cancelar eliminación
  const handleConfirmDelete = () => {
    if( !hasChildren )
      window.deleteNote( id2 );
    else
      window.deleteFolder( id2 );
    
    setIsConfirmOpen( false );
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen( false );
  };

  // -----------------------------------------------------------------
  // Evento Click
  // -----------------------------------------------------------------

  // Función para manejar los eventos de los items
  function handleClick() {

    // Seleccionamos el item
    window.setSelectedItemId2( id2 );

    if( hasChildren ) {

      // Si es carpeta, recarga su contenido y expande/colapsa
      if( collapsed && typeof window.getNotesForFolder === 'function' )
        window.getNotesForFolder( id );
        
      // Toggle
      if( typeof onToggle === 'function' )
        onToggle();
    } else {

      // Si es nota, carga el Markdown en el editor
      if( typeof window.readNote === 'function' )
        window.readNote( id2 );
    }
  }

  // Menú contextual: muestra con click derecho
  function handleContextMenu( e ) {
    e.preventDefault();

    setMenuOptions( [
      { label: 'Eliminar', onClick: () => {
          setIsConfirmOpen( true );
          closeMenu();
        } 
      },

      /*
      { label: 'Renombrar', onClick: () => alert('Renombrar: ' + title) },
      { divider: true },
      { label: hasChildren ? 'Nueva nota' : 'Duplicar', onClick: () => alert('Acción especial sobre: ' + title) },
      */
    ] );

    // Calculamos la posición del click respecto al panel
    const panelRect = panelRef.current.getBoundingClientRect();
    const x = e.clientX - panelRect.left + panelRef.current.scrollLeft + 50;
    const y = e.clientY - panelRect.top + panelRef.current.scrollTop + 65;

    setMenuPos({ x, y });
  }

  function closeMenu() {
    setMenuPos( { x: null, y: null } );
  }

  // Sangrado según la profundidad
  const indentStyle = { paddingLeft: `${depth * 16}px` };

  return (
    <>
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
        <span title={title} className={styles.title}>{title}</span>
        <ContextMenu
          options={menuOptions}
          x={menuPos.x - 50}
          y={menuPos.y}
          onClose={closeMenu}
        />
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title={hasChildren ? 'Eliminar carpeta' : 'Eliminar nota'}
        message={`¿Estás seguro de eliminar “${title}”?`}
        icon={hasChildren ? FolderIcon : FileIcon}
        confirmText="Sí, eliminar"
        cancelText="No, cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}