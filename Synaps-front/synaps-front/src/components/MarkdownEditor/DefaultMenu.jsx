// -------------------------------------------------------------------------
// DefaultMenu.jsx - Menú por defecto cuando no hay nota seleccionada
// -------------------------------------------------------------------------

import React, { useState } from 'react';
import { ReactComponent as BookCopy } from '../../assets/icons/book-copy.svg';
import { ReactComponent as NewFileIcon } from '../../assets/icons/new-file.svg';
import { ReactComponent as NewFolderIcon } from '../../assets/icons/new-folder.svg';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload.svg';
import FileUploadModal from '../Atomic/Modal/FileUploadModal';
import './DefaultMenu.css';

/**
 * Menú por defecto estilo VS Code que aparece cuando no hay nota seleccionada
 */
export default function DefaultMenu() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const handleNewNote = () => {
    // Crear nueva nota usando la función global
    if(typeof window.toggleInput === 'function') {
      window.toggleInput('newNote');
    }
  };

  const handleNewFolder = () => {
    // Crear nueva carpeta usando la función global
    if(typeof window.toggleInput === 'function') {
      window.toggleInput('newFolder');
    }
  };

  const handleUploadFile = () => {
    setShowUploadModal(true);
  };

  // Manejar upload exitoso
  const handleUploadSuccess = (note) => {
    console.log('Archivo subido exitosamente:', note);
    setShowUploadModal(false);
  };

  return (
    <div className="default-menu-container">
      <div className="default-menu-header">
        <BookCopy className="default-menu-main-icon" />
        <h2 className="default-menu-title">Editor de Markdown</h2>
        <p className="default-menu-subtitle">
          Selecciona una nota del panel lateral o crea una nueva para comenzar a escribir.
        </p>
      </div>
      
      <div className="default-menu-actions">
        
        <button className="default-menu-action" onClick={handleNewNote}>
          <NewFileIcon className="action-icon" />
          <div className="action-content">
            <span className="action-title">Nueva Nota</span>
            <span className="action-description">Crea una nueva nota markdown</span>
          </div>
        </button>
        
        <button className="default-menu-action" onClick={handleNewFolder}>
          <NewFolderIcon className="action-icon" />
          <div className="action-content">
            <span className="action-title">Nueva Carpeta</span>
            <span className="action-description">Organiza tus notas en carpetas</span>
          </div>
        </button>

        <button className="default-menu-action" onClick={handleUploadFile}>
          <UploadIcon className="action-icon" />
          <div className="action-content">
            <span className="action-title">Subir Archivo</span>
            <span className="action-description">Sube un archivo .md existente</span>
          </div>
        </button>
      </div>

      {/* Modal para subir archivo */}
      <FileUploadModal
        isOpen={showUploadModal}
        onUpload={handleUploadSuccess}
        onCancel={() => setShowUploadModal(false)}
      />
    </div>
  );
}
