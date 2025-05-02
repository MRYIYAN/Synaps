// ------------------------------------------------------------------------------------------------
// GalaxyGraph.jsx
// ------------------------------------------------------------------------------------------------

import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

/**
 * GalaxyGraph
 * Componente para mostrar un gráfico interactivo con estilo Obsidian.
 *
 * @param {{ data: { nodes: Node[], links: Link[] } } } props - Datos de nodos y enlaces.
 * @returns {JSX.Element}
 */
const GalaxyGraph = ( { data } ) => {

  // Paleta de colores inspirados en los nodos de Obsidian
  const NODES_COLOR_PALETTE = [
      211 // Azul cielo
    , 158 // Verde esmeralda
    , 22  // Naranja
    , 340 // Rosa
    , 272 // Violeta
    , 49  // Amarillo ámbar
    , 237 // Índigo
  ];

  // Función para generar un color pastel usando la paleta HSL
  const generate_random_color = () => {
    const hue = NODES_COLOR_PALETTE[
      Math.floor( Math.random() * NODES_COLOR_PALETTE.length )
    ];

    // Saturación 70%, luminosidad 80% garantizan tonos pastel
    return `hsl(${hue}, 70%, 80%)`;
  };

  /*
    Ejemplo de los datos recibidos

    const data = {
      nodes: [
        { id: 'node1', name: 'Nodo 1', group: 1 },
        { id: 'node2', name: 'Nodo 2', group: 1 },
        { id: 'node3', name: 'Nodo 3', group: 2 },
        ...
      ],

      links: [
        { source: 'node1', target: 'node2' },
        { source: 'node2', target: 'node3' }
        ...
      ]
    };
  */

  /**
   * Referencia 'graph_pointer'
   * Aquí guardamos un puntero que apunta al grafo una vez que aparece en pantalla.
   * Con este puntero podemos volver y ajustar o mover el grafo sin perder la posición.
   */
  const graph_pointer = useRef( null );

  // Creamos un mapa de colores para cada grupo de nodos
  const group_colors = {};
  data.nodes.forEach( ( node ) => {
    if( !group_colors[node.group] )
      group_colors[node.group] = generate_random_color();
  } );

  // Calculamos el número de conexiones que tiene cada nodo
  let nodes_count = {};
  data.nodes.forEach( ( node ) => { nodes_count[node.id] = 0 } );
  data.links.forEach( ( link ) => {

    // Añadimos el link
    if( link.target in nodes_count )
      nodes_count[link.target]++;
  } );

  // ------------------------------------------------------------------------------------------------
  // Ready | Efectos de repulsión y asignación de IDs a nodos
  // ------------------------------------------------------------------------------------------------

  // Ajustamos la distancia y repulsión de los nodos dentro del gráfico
  useEffect( () => {

    // Capturamos la posición actual del puntero
    const graph = graph_pointer.current;

    // Si existe el gráfico, aplicamos los efectos de repulsión
    if( graph ) {

      // Aplicamos la repulsión a los nodos
      graph.d3Force( 'charge' ).strength( -100 );

      // Definimos la longitud de los enlaces
      // Añadimos el id correspondiente a cada nodo
      graph.d3Force( 'link' ).distance( 75 ).id( ( node ) => node.id );
    }
  }, [] );

  // ------------------------------------------------------------------------------------------------
  // Gráfico
  // ------------------------------------------------------------------------------------------------

  return (
    <ForceGraph2D
      ref              = {graph_pointer}  // Vinculamos el puntero del gráfico
      graphData        = {data}           // Datos del gráfico
      backgroundColor  = '#fff'           // Fondo oscuro estilo Obsidian
      nodeCanvasObject = { ( node, ctx, graph_scale ) => {

        // Creamos el nodo en forma de círculo con un SVG
        const radius = 8 + ( nodes_count[node.id] * 3.5 );
        ctx.beginPath();
        ctx.arc( node.x, node.y, radius, 0, 2 * Math.PI, false );
        ctx.fillStyle = group_colors[node.group];
        ctx.fill();

        // Solo mostramos el texto cuando haya suficiente zoom
        // Ajusta el valor 4 según la sensibilidad que quieras
        if( graph_scale > 0.75 ) {

          // Tamaño de la fuente
          ctx.font      = `${14 / graph_scale}px Sans`;
          ctx.fillStyle = '#7e7e7e';
          ctx.fillText(
            node.name,                // Texto a mostrar
            node.x + radius + 2,      // Posición horizontal (x)
            node.y + 4 / graph_scale  // Posición vertical (y)
          );
        }
      } }

      linkColor       = '#dcdcdc' // Color tenue para enlaces
      linkWidth       = {1}       // Grosor de los enlaces
      nodeLabel       = 'name'    // Muestra nombre al pasar el ratón
      nodeAutoColorBy = 'group'   // Color automático según grupo

      // -----------------------------------------------------------------------------------------------
      // EVENTOS DRAG
      // -----------------------------------------------------------------------------------------------

      // Al arrastrar, desactivamos la repulsión para que los demás nodos no se muevan
      onNodeDrag = { ( node ) => {
        const graph = graph_pointer.current;
        graph.d3Force( 'charge' ).strength( 0 );
      } }

      // Al soltar, restauramos la repulsión original
      onNodeDragEnd = { ( node ) => {
        const graph = graph_pointer.current;
        graph.d3Force( 'charge' ).strength( -50 );
      } }

      // Evento onClick
      onNodeClick = { ( node ) => {
        console.log( node.id );
      } }

      // Ajustamos el zoom al terminar el cálculo
      onEngineStop={ () => graph_pointer.current.zoomToFit( 1000 ) } 
    />
  );
};

export default GalaxyGraph;