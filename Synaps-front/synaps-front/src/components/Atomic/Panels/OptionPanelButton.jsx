/**
 * @file OptionPanelButton.jsx
 * @description Botón con icono SVG para el panel de opciones.
 *
 * @param {Object} props
 * @param {JSX.Element} props.icon - Icono como componente React.
 */

import React from "react";

export default function OptionPanelButton({ icon: Icon }) {
  return (
    <button className="option-panel-button" type="button">
      <Icon />
    </button>
  );
}
