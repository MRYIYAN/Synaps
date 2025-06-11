import React, { useEffect, useState } from "react";

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

import { http_get } from '../lib/http';
import { ReactComponent as LoadingSpinner } from "../assets/icons/loading-spinner.svg";
import SidebarPanel from "../components/SidebarPanel";
import GalaxyGraph from "../components/GalaxyGraph";

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const GalaxyView = function() {

  const [graphData, setGraphData] = useState(null);

  useEffect( () => {

    // Llamada para capturar datos de la DB
    const fetchData = async () => {
      let url = 'http://localhost:8010/api/galaxyGraph';
      const { result, http_data } = await http_get( url );

      // Solo setea si tienes nodos y links
      if( result === 1 && http_data.nodes && http_data.links ) {
        setGraphData( {
          nodes: http_data.nodes,
          links: http_data.links,
        } );
      }
    };

    fetchData();

  }, [] );

    // Puedes poner un loading temporal
  if( !graphData )
    return (
    <div className="layout-markdown-editor">
      <SidebarPanel defaultSelectedItem="galaxyview" />
      <div className="loading-icon-container">
        <LoadingSpinner className="status-icon loading animate-spin" />
      </div>
    </div>
  );

  // HTML del formulario
  return (
    <div className="layout-markdown-editor">
      <SidebarPanel defaultSelectedItem="galaxyview" />
      <GalaxyGraph data={graphData} />
    </div>
  );
}

export default GalaxyView;
