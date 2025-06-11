/**
 * @file DropIndicator.jsx
 * @description Línea visual que aparece al arrastrar una nota encima de otra.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Indica si el indicador está visible.
 */

import React from "react";
import styles from "./NoteTree.css";

export default function DropIndicator({ visible }) {
  // Si no está visible, no renderizamos nada
  if(!visible) return null;

  // Renderizamos la línea de indicación
  return <div className={styles.drop_indicator} role="presentation" />;
}
