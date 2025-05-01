import React from "react";
import "./styles/PixelButton.css";

function PixelButton( { icon: Icon, gap = 6, speed = 35 } ) {
  return (
    <button className="sidebar_button">
      <pixel-canvas data-gap={ gap } data-speed={ speed }></pixel-canvas>
      <Icon className="icon" />
    </button>
  );
}

export default PixelButton;