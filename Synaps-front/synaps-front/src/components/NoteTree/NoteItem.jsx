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

import React from "react";
import styles from "./NoteTree.css";
import { ReactComponent as FolderIcon } from "../../assets/icons/folder.svg";
import { ReactComponent as FileIcon }   from "../../assets/icons/file.svg";

export default function NoteItem( {
  id2,
  title,
  depth,
  hasChildren,
  collapsed,
  selected,
  onToggle,
} ) {

  // Sangrado según la profundidad
  const indentStyle = { paddingLeft: `${depth * 16}px` };

  return (
    <div
      className={`node-item ${selected ? "selected" : ""}`}
      role="treeitem"
      aria-expanded={hasChildren ? !collapsed : undefined}
      aria-selected={selected}
      id={id2}
      onClick={hasChildren ? onToggle : undefined}
      style={indentStyle}
    >
      {/* Muestra icono de carpeta si tiene hijos, de archivo si no */}
      {hasChildren
        ? <FolderIcon className={"node-tree-icon"} aria-label={collapsed ? "Expandir" : "Colapsar"} />
        : <FileIcon className={"node-tree-icon"} aria-hidden="true" />
      }

      {/* Título de la nota */}
      <span className={styles.title}>{title}</span>
    </div>
  );
}