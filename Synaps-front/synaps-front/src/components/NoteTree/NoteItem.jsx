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
import { Link, useLocation } from 'react-router-dom';

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
  const [menuPos, setMenuPos]             = useState( { x: null, y: null } );
  const [menuOptions, setMenuOptions]     = useState( [] );
  const [isConfirmOpen, setIsConfirmOpen] = useState( false );
  const [isEditMode, setIsEditMode]       = useState( false );
  const [editTitle, setEditTitle]         = useState( title );

  // Localización de ruta para detectar galaxy view
  const location = useLocation();
  const isGalaxyView = location.pathname.includes('galaxyview');

  // Capturamos la referencia del Panel
  const panelRef = useContext( PanelRefContext );

  // -----------------------------------------------------------------
  // Modal y edición
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

  // Lógica para editar título
  const handleEdit = () => {
    setIsEditMode( true );
    setEditTitle( title );
    closeMenu();
  };

  const handleSaveEdit = () => {
    if( editTitle.trim() !== title && editTitle.trim() !== '' ) {
      // Llamar a la función para renombrar
      if( hasChildren && typeof window.renameFolder === 'function' ) {
        window.renameFolder( id2, editTitle.trim() );
      } else if( !hasChildren && typeof window.renameNote === 'function' ) {
        window.renameNote( id2, editTitle.trim() );
      }
    }
    setIsEditMode( false );
  };

  const handleCancelEdit = () => {
    setIsEditMode( false );
    setEditTitle( title );
  };

  const handleKeyPress = ( e ) => {
    if( e.key === 'Enter' ) {
      handleSaveEdit();
    } else if( e.key === 'Escape' ) {
      handleCancelEdit();
    }
  };

  // -----------------------------------------------------------------
  // Evento Click
  // -----------------------------------------------------------------

  // Función para manejar los eventos de los items
  function handleClick() {

    // Seleccionamos el item
    window.setSelectedItemId2( id2 );

    if( hasChildren ) {

      // Si es carpeta, recarga su contenido y expande/colapsa con un solo click
      if( typeof window.getNotesForFolder === 'function' )
        window.getNotesForFolder( id );
        
      // Toggle inmediato
      if( typeof onToggle === 'function' )
        onToggle();
    } else {

      // Si es nota, carga el Markdown en el editor
      if( typeof window.readNote === 'function' )
        window.readNote( id2, window.currentVaultId ); 
    }
  }

  // Menú contextual: muestra con click derecho
  function handleContextMenu( e ) {
    e.preventDefault();

    setMenuOptions( [
      { label: 'Editar', onClick: handleEdit },
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

        {/* En galaxy view, los nodos de nota enlazan a la página de editor */}
        {isEditMode ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveEdit}
            autoFocus
            className={styles.editInput}
          />
        ) : isGalaxyView && !hasChildren ? (
          <Link to={`/markdowneditor/${id2}`} className={styles.title}>
            <span title={title} className={styles.title}>{title}</span>
          </Link>
        ) : (
          <span title={title} className={styles.title}>{title}</span>
        )}
        
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