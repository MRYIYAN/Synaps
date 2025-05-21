//===========================================================================   //
//                     SECCIÓN DE COMUNIDAD DE SYNAPS                          //
//===========================================================================   //
//  Este componente muestra la sección de comunidad en la página de landing.    //
//  Presenta estadísticas de la comunidad, beneficios de unirse y opciones      //
//  para contribuir al proyecto a través de GitHub y Discord.                   //
//  Incluye iconos SVG animados con efectos de gradiente tipo "lava líquida"    //
//  que mejoran la experiencia visual de los usuarios.                          //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       
//===========================================================================//
import React from 'react';
import './CommunitySection.css';
// Importamos los iconos desde los archivos SVG
import { ReactComponent as DiscordIcon } from '../../../assets/icons/discord.svg';
import { ReactComponent as GitHubIcon } from '../../../assets/icons/github.svg';
//===========================================================================//

const CommunitySection = () => {
  //---------------------------------------------------------------------------//
  //  Datos de estadísticas de la comunidad que se mostrarán                   //
  //---------------------------------------------------------------------------//
  const communityStats = [
    { id: 1, number: "10K+", label: "Usuarios activos" },
    { id: 2, number: "50+", label: "Colaboradores" },
    { id: 3, number: "120+", label: "Países" },
  ];

  //---------------------------------------------------------------------------//
  //  Componentes de iconos SVG inline con efectos de gradiente animado        //
  //  Estos iconos utilizan un gradiente de tipo "lava líquida" animada        //
  //  y un efecto de brillo para destacar visualmente en la interfaz           //
  //---------------------------------------------------------------------------//
  
  // Icono de refrescar/actualizar para "Intercambia ideas"
  const InlineRefreshIcon = ({ size = 24 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-icon inline-refresh-icon"
    >
      <path 
        d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" 
        fill="none"
        stroke="url(#liquid-gradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
    </svg>
  );

  // Icono de maletín para "Colabora en proyectos"
  const InlineBriefcaseIcon = ({ size = 24 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-icon inline-briefcase-icon"
    >
      <rect 
        x="2" 
        y="7" 
        width="20" 
        height="14" 
        rx="2" 
        ry="2" 
        fill="none"
        stroke="url(#liquid-gradient)"
        strokeWidth={2}
        filter="url(#glow)"
      />
      <path 
        d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" 
        fill="none"
        stroke="url(#liquid-gradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
    </svg>
  );

  // Icono de nodos conectados para "Descubre nuevas formas"
  const InlineBrainIcon = ({ size = 24 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-icon inline-brain-icon"
    >
      {/* Nodos principales que representan ideas interconectadas */}
      <circle 
        cx="6" 
        cy="6" 
        r="2" 
        fill="none" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        filter="url(#glow)" 
      />
      <circle 
        cx="18" 
        cy="6" 
        r="2" 
        fill="none" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        filter="url(#glow)" 
      />
      <circle 
        cx="12" 
        cy="12" 
        r="2.5" 
        fill="none" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        filter="url(#glow)" 
      />
      <circle 
        cx="6" 
        cy="18" 
        r="2" 
        fill="none" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        filter="url(#glow)" 
      />
      <circle 
        cx="18" 
        cy="18" 
        r="2" 
        fill="none" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        filter="url(#glow)" 
      />
      
      {/* Conexiones entre nodos que simbolizan la relación entre ideas */}
      <line 
        x1="7.5" 
        y1="7.5" 
        x2="10.5" 
        y2="10.5" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        filter="url(#glow)" 
      />
      <line 
        x1="16.5" 
        y1="7.5" 
        x2="13.5" 
        y2="10.5" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        filter="url(#glow)" 
      />
      <line 
        x1="7.5" 
        y1="16.5" 
        x2="10.5" 
        y2="13.5" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        filter="url(#glow)" 
      />
      <line 
        x1="16.5" 
        y1="16.5" 
        x2="13.5" 
        y2="13.5" 
        stroke="url(#liquid-gradient)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        filter="url(#glow)" 
      />
    </svg>
  );

  //---------------------------------------------------------------------------//
  //  Renderizado del componente de la sección de comunidad                    //
  //---------------------------------------------------------------------------//
  return (
    <section id="community" className="community-section landing-section">
      {/* 
        SVG con definiciones de gradientes y filtros utilizados por los iconos
        Este SVG está oculto pero contiene las definiciones necesarias para los
        efectos visuales de los iconos en toda la sección
      */}
      <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
        <defs>
          {/* Gradiente animado tipo "lava líquida" para los iconos */}
          <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff4d00">
              <animate 
                attributeName="stop-color" 
                values="#ff4d00;#ff8700;#ff4d00" 
                dur="3s" 
                repeatCount="indefinite" 
              />
            </stop>
            <stop offset="50%" stopColor="#ff8700">
              <animate 
                attributeName="stop-color" 
                values="#ff8700;#ff4d00;#ff8700" 
                dur="3s" 
                repeatCount="indefinite" 
              />
            </stop>
            <stop offset="100%" stopColor="#ff4d00">
              <animate 
                attributeName="stop-color" 
                values="#ff4d00;#ff8700;#ff4d00" 
                dur="3s" 
                repeatCount="indefinite" 
              />
            </stop>
          </linearGradient>
          
          {/* Filtro de brillo para iconos de beneficios */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Filtro específico con brillo anaranjado para iconos de redes sociales */}
          <filter id="icon-glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 1
                0 1 0 0 0.5
                0 0 1 0 0
                0 0 0 3 0
              "
            />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
      
      <div className="landing-container">
        {/* Título principal de la sección */}
        <h2 className="community-title landing-heading-lg">Una comunidad global de creadores</h2>
        
        {/* Estadísticas de la comunidad - Indicadores clave */}
        <div className="community-stats">
          {communityStats.map(stat => (
            <div key={stat.id} className="community-stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contenido principal de la sección de comunidad */}
        <div className="community-content">
          {/* Información sobre la comunidad y sus beneficios */}
          <div className="community-info">
            <div className="info-card">
              <h3 className="community-subtitle landing-heading-md">Aprende, comparte y colabora</h3>
              <p className="community-description landing-text-md">
                Synaps es más que una herramienta; es una comunidad de pensadores, creadores y 
                profesionales que comparten conocimientos y colaboran en proyectos innovadores.
              </p>
              
              {/* Lista de beneficios con iconos animados */}
              <ul className="community-benefits">
                <li className="benefit-item">
                  <span className="benefit-icon">
                    <InlineRefreshIcon />
                  </span>
                  <span className="benefit-text">Intercambia ideas y recibe feedback valioso</span>
                </li>
                <li className="benefit-item">
                  <span className="benefit-icon">
                    <InlineBriefcaseIcon />
                  </span>
                  <span className="benefit-text">Colabora en proyectos de código abierto</span>
                </li>
                <li className="benefit-item">
                  <span className="benefit-icon">
                    <InlineBrainIcon />
                  </span>
                  <span className="benefit-text">Descubre nuevas formas de potenciar tu productividad</span>
                </li>
              </ul>
              
              {/* Efecto de brillo para la tarjeta de información */}
              <div className="info-card-glow"></div>
            </div>
          </div>
          
          {/* Acciones de la comunidad - Tarjeta de contribución */}
          <div className="community-actions">
            <div className="community-card">
              {/* Diseño del encabezado tipo ventana */}
              <div className="card-header">
                <div className="card-header-dot"></div>
                <div className="card-header-dot"></div>
                <div className="card-header-dot"></div>
              </div>
              
              {/* Contenido de la tarjeta de contribución */}
              <div className="card-content">
                <h4 className="card-title">Contribuye al proyecto</h4>
                <p className="card-description">
                  Synaps es un proyecto de código abierto que mejora constantemente gracias a nuestra comunidad.
                </p>
                
                {/* Botones de acción para unirse a la comunidad */}
                <div className="card-buttons">
                  <a href="https://github.com/synaps-project" className="landing-btn landing-btn-secondary" target="_blank" rel="noopener noreferrer">
                    <span className="btn-icon github-icon-wrapper">
                      <GitHubIcon className="github-icon" />
                    </span>
                    GitHub
                  </a>
                  <a href="https://discord.gg/synaps" className="landing-btn landing-btn-secondary" target="_blank" rel="noopener noreferrer">
                    <span className="btn-icon discord-icon-wrapper">
                      <DiscordIcon className="discord-icon" />
                    </span>
                    Discord
                  </a>
                </div>
              </div>
              
              {/* Efecto de brillo para la tarjeta de comunidad */}
              <div className="card-glow-effect"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

//===========================================================================//
//                             EXPORTACIÓN                                   
//===========================================================================//
export default CommunitySection;