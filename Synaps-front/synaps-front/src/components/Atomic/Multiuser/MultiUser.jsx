import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './MultiUserComponent.css';

// Iconos SVG inline para evitar dependencias
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Icono de punto de estado
const StatusDot = ({ isOnline }) => (
  <div className={`user-status-dot ${isOnline ? 'online' : 'offline'}`} />
);

// Indicadores de usuarios activos
const UserIndicator = ({ user, index, onClick }) => (
  <div 
    className="multiuser-indicator" 
    style={{ zIndex: 10 - index }}
    title={user.name}
    onClick={onClick}
  >
    {user.avatar}
  </div>
);

/**
 * Modal para invitar colaboradores - Diseño específico de Synaps
 */
const MultiUserModal = ({ isOpen, onClose, documentTitle = "Documento sin título" }) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const linkUrl = `http://localhost:3000/collaborator`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="multiuser-modal-overlay" onClick={onClose}>
      <div className="multiuser-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="multiuser-header">
          <h2>Compartir "{documentTitle}"</h2>
          <button
            className="multiuser-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="multiuser-content">
          <p className="multiuser-description">
            Comparte este documento con otros usuarios para colaborar en tiempo real.
          </p>

          {/* Link sharing section */}
          <div className="multiuser-link-container">
            <input
              type="text"
              value={linkUrl}
              readOnly
              className="multiuser-link-input"
              aria-label="Enlace para compartir"
            />
            <button
              className={`multiuser-copy-button ${linkCopied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              aria-label="Copiar enlace"
            >
              {linkCopied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          {/* Access level section */}
          <div className="multiuser-access-section">
            <label htmlFor="access-level" className="multiuser-access-label">
              Nivel de acceso
            </label>
            <select id="access-level" className="multiuser-access-select">
              <option value="edit">Puede editar</option>
              <option value="comment">Puede comentar</option>
              <option value="view">Solo ver</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

/**
 * Botón flotante para acceder a las funciones multiusuario
 * Se posiciona en la esquina inferior derecha del editor
 */
const MultiUserButton = ({ documentTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const userListRef = useRef(null);
  const [activeUsers] = useState([
    { 
      id: 1, 
      name: 'Daniel Correa Villa', 
      avatar: 'D', 
      color: '#F56E0F',
      email: 'daniel.correa@synaps.app',
      isOnline: true,
      lastSeen: 'Ahora'
    },
    { 
      id: 2, 
      name: 'Héctor Augusto', 
      avatar: 'H', 
      color: '#ff8534',
      email: 'hector.augusto@synaps.app',
      isOnline: true,
      lastSeen: 'Hace 2 min'
    },
    { 
      id: 3, 
      name: 'IanP', 
      avatar: 'I', 
      color: '#F56E0F',
      email: 'ian.p@synaps.app',
      isOnline: false,
      lastSeen: 'Hace 15 min'
    }
  ]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userListRef.current && !userListRef.current.contains(event.target)) {
        setIsUserListOpen(false);
      }
    };

    if (isUserListOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserListOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleUserList = (e) => {
    e.stopPropagation();
    setIsUserListOpen(!isUserListOpen);
  };

  return (
    <>
      {/* Contenedor del botón flotante */}
      <div className="multiuser-float-container" ref={userListRef}>
        <div className="multiuser-share-container">
          {/* Indicadores de usuarios activos */}
          {activeUsers.length > 0 && (
            <>
              <div className="multiuser-indicators-group" onClick={handleToggleUserList}>
                {activeUsers.slice(0, 3).map((user, index) => (
                  <UserIndicator 
                    key={user.id} 
                    user={user} 
                    index={index}
                    onClick={handleToggleUserList}
                  />
                ))}
                {activeUsers.length > 3 && (
                  <div 
                    className="multiuser-indicator multiuser-indicator-more"
                    onClick={handleToggleUserList}
                  >
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
              
              {/* Separador visual */}
              <div className="multiuser-separator"></div>
            </>
          )}

          {/* Botón principal de compartir */}
          <button 
            className="multiuser-float-button"
            onClick={handleOpenModal}
            title="Compartir documento"
          >
            <ShareIcon />
            <span>Compartir</span>
          </button>
        </div>

        {/* Lista desplegable de usuarios */}
        {isUserListOpen && (
          <div className="multiuser-dropdown">
            <div className="multiuser-dropdown-header">
              <h3>Usuarios conectados</h3>
              <span className="user-count">{activeUsers.length}</span>
            </div>
            <div className="multiuser-dropdown-list">
              {activeUsers.map((user) => (
                <div key={user.id} className="multiuser-dropdown-item">
                  <div className="user-avatar-container">
                    <div 
                      className="user-avatar"
                      style={{ background: user.color }}
                    >
                      {user.avatar}
                    </div>
                    <StatusDot isOnline={user.isOnline} />
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-status">
                      {user.isOnline ? 'En línea' : `Desconectado · ${user.lastSeen}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de compartir */}
      <MultiUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        documentTitle={documentTitle}
      />
    </>
  );
};

export { MultiUserModal, MultiUserButton };
export default MultiUserButton;