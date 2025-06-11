
// -------------------------------------------------------------------------
// FileUploadModal.jsx - Modal para subir archivos .md
// -------------------------------------------------------------------------

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as CloseIcon } from '../../../assets/icons/close.svg';
import { ReactComponent as UploadIcon } from '../../../assets/icons/upload.svg';
import { ReactComponent as FileIcon } from '../../../assets/icons/new-file.svg';
import { showErrorNotification } from '../Notification/NotificationSystem';

/**
 * Custom HTTP POST function for file uploads with FormData
 * Similar to http_post but handles FormData instead of JSON
 */
const http_post_file = async(url, formData) => {
  let result = 0;
  let message = '';
  let http_data = [];

  try {
    // Headers for FormData - don't set Content-Type, let browser set it with boundary
    const headers = {};
    
    // Add authorization token if exists
    const token = localStorage.getItem('access_token');
    if(token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
      credentials: 'include'
    });

    const responseData = await response.json();

    if(!response.ok) {
      message = responseData.message || response.statusText || 'Error';
      showErrorNotification(message);
    } else {
      // Extraer la estructura correcta de la respuesta
      result = responseData.result || 1;
      message = responseData.message || 'OK';
      http_data = responseData.http_data || responseData; // Si no hay http_data, usar la respuesta completa
    }

  } catch (error) {
    message = error.message || 'Network error';
    showErrorNotification(message);
  }

  return { result, message, http_data };
};

/**
 * Modal para subir archivos de texto/markdown
 * 
 * Props:
 * @param {boolean} isOpen - Muestra u oculta el modal
 * @param {Function} onUpload - Callback cuando se sube un archivo exitosamente
 * @param {Function} onCancel - Callback al cancelar o cerrar
 */
const FileUploadModal = ({
  isOpen,
  onUpload,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Efecto para enfocar el modal cuando se abre
  useEffect(() => {
    if(isOpen && !selectedFile) {
      // Auto-click del dropzone si no hay archivo seleccionado
      setTimeout(() => {
        const dropzone = document.querySelector('.upload-dropzone');
        if(dropzone) {
          dropzone.focus();
        }
      }, 100);
    }
  }, [isOpen, selectedFile]);

  // Manejar tecla Escape y Enter
  const handleKeyDown = (e) => {
    if(e.key === 'Escape' && !isUploading) {
      handleClose();
    } else if(e.key === 'Enter' && selectedFile && !isUploading) {
      handleUpload();
    }
  };

  // Función para cerrar el modal y limpiar estado
  const handleClose = () => {
    if(!isUploading) {
      setSelectedFile(null);
      setError('');
      setUploadProgress(0);
      setDragActive(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onCancel();
    }
  };

  if(!isOpen) return null;

  // Validar archivo
  const validateFile = (file) => {
    const allowedTypes = ['.md'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if(!allowedTypes.includes(extension)) {
      return 'Solo se permiten archivos .md';
    }
    
    if(file.size > maxSize) {
      return 'El archivo no puede ser mayor a 10MB';
    }
    
    return null;
  };

  // Manejar selección de archivo
  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if(error) {
      setError(error);
      return;
    }
    
    setError('');
    setSelectedFile(file);
  };

  // Manejar cambio en input de archivo
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      handleFileSelect(file);
    }
  };

  // Manejar drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if(files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Subir archivo
  const handleUpload = async() => {
    if(!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Crear FormData para el archivo
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('parent_id2', window.selectedItemId2 || '');

      // Realizar la subida con seguimiento de progreso
      const { result, http_data } = await http_post_file('http://localhost:8010/api/uploadFile', formData);

      if(result !== 1) {
        throw new Error(http_data.message || 'Error al subir el archivo');
      }
       if(result !== 1) {
        throw new Error(http_data.message || 'Error al subir el archivo');
      }
      
      // Crear nota basada en el archivo subido
      const noteData = http_data.note;
      const note = {
        id: noteData.note_id,
        id2: noteData.note_id2,
        title: noteData.note_title,
        parent_id: noteData.parent_id,
        type: 'note'
      };

      // Actualizar la lista de notas globalmente evitando duplicados
      if(window.currentNotes) {
        const noteExists = window.currentNotes.some(existingNote => existingNote.id2 === note.id2);
        
        if(!noteExists) {
          window.currentNotes = [...window.currentNotes, note];
        }
      }

      // Marcar como seleccionado el nuevo item
      if(window.setSelectedItemId2) {
        window.setSelectedItemId2(noteData.note_id2);
      }
      
      // Abrir la nota
      if(window.readNote) {
        window.readNote(noteData.note_id2, window.currentVaultId);
      }

      // Llamar al callback de éxito
      onUpload(note);
      
      // Limpiar estado
      setSelectedFile(null);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setError(error.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  // Limpiar selección de archivo
  const handleClearFile = () => {
    setSelectedFile(null);
    setError('');
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const modalContent = (
    <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="modal-content file-upload-modal">
        {/* Header del modal */}
        <div className="modal-header">
          <div className="modal-title-container">
            <UploadIcon className="modal-icon" />
            <h3 className="modal-title">Subir Archivo</h3>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={handleClose} 
            aria-label="Cerrar"
            disabled={isUploading}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="modal-body">
          {/* Zona de drag and drop */}
          <div 
            className={`upload-dropzone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            style={{ cursor: selectedFile ? 'default' : 'pointer' }}
            tabIndex={0}
          >
            {selectedFile ? (
              <div className="file-selected">
                <FileIcon className="file-icon" />
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                {!isUploading && (
                  <button 
                    className="clear-file-button" 
                    onClick={handleClearFile}
                    aria-label="Quitar archivo"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <div className="upload-prompt">
                <UploadIcon className="upload-icon-large" />
                <p className="upload-text-primary">
                  Arrastra y suelta tu archivo aquí
                </p>
                <p className="upload-text-secondary">
                  o haz clic para seleccionar
                </p>
                <p className="upload-text-info">
                  Solo archivos .md (máx. 10MB)
                </p>
              </div>
            )}

            {/* Input oculto para seleccionar archivos */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".md,.txt"
              style={{ display: 'none' }}
            />
          </div>

          {/* Barra de progreso */}
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="progress-text">Subiendo... {uploadProgress}%</p>
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Footer con botones */}
        <div className="modal-footer">
          <button 
            className="modal-button secondary" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </button>
          <button 
            className="modal-button primary" 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </div>
    </div>
  );

  // No renderizar nada si el modal está cerrado
  if(!isOpen) return null;

  // Renderizar el modal usando createPortal para que aparezca fuera del sidebar
  return createPortal(modalContent, document.body);
};

export default FileUploadModal;
