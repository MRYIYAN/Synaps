//====================================================================================//
//                                COMPONENTE FOLDER PICKER BUTTON                     //
//====================================================================================//

import React, { useRef, useState } from 'react';
import ArchiveIcon from '../Icons/ArchiveIcon';

//====================================================================================//
//                                FUNCION PRINCIPAL                                   //
//====================================================================================//

/**
 * Botón para seleccionar una carpeta usando webkitdirectory.
 * @param {Function} onFolderSelected - Callback para devolver la ruta de la carpeta seleccionada.
 * @param {boolean} disabled - Si debe deshabilitar el botón.
 */
const FolderPickerButton = ({ onFolderSelected, disabled = false }) => {
  //--------------------------------//
  //  Estados para efectos visuales
  //--------------------------------//
  const [isHovered, setIsHovered] = useState(false);

  //--------------------------------//
  //  Referencia al input de tipo file 
  //--------------------------------//
  const fileInputRef = useRef(null);

  //----------------------------------// 
  // Manejar el clic en el botón 
  //----------------------------------//
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  //----------------------------------// 
  // Manejar eventos de hover 
  //----------------------------------//
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  //---------------------------------------------// 
  // Manejar el cambio de carpeta seleccionada 
  //---------------------------------------------//
  const handleFolderChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      try {
        // Obtener el nombre de la carpeta
        const folderName = files[0].webkitRelativePath.split('/')[0];
        
        // Construir una ruta completa simulada
        const basePath = '/home/user/Synaps/Vaults/';
        const fullPath = `${basePath}${folderName}`;
        
        // Devolver la ruta completa
        onFolderSelected(fullPath);
      } catch (error) {
        console.error('Error al procesar la carpeta seleccionada:', error);
        // En caso de error, al menos devolvemos el nombre del archivo sin ruta
        if (files[0] && files[0].name) {
          onFolderSelected(`/Synaps/Vaults/${files[0].name}`);
        }
      }
    }
  };

  //====================================================================================//
  //                                RENDERIZADO                                         //
  //====================================================================================//

  return (
    <>
      {/* Botón para seleccionar carpeta integrado en el input */}
      <div 
        className="folder-picker-inline"
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '4px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease',
          backgroundColor: isHovered ? 'rgba(245, 110, 15, 0.08)' : 'transparent'
        }}
        onClick={disabled ? undefined : handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Seleccionar carpeta"
      >
        <ArchiveIcon 
          size={20} 
          style={{
            color: isHovered ? 'var(--liquid_lava)' : '#888',
            stroke: isHovered ? 'var(--liquid_lava)' : '#888',
            transition: 'color 0.2s ease, stroke 0.2s ease',
            strokeWidth: '1.5'
          }}
        />
      </div>

      {/* Input oculto para seleccionar carpeta */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFolderChange}
        disabled={disabled}
      />
    </>
  );
};

//====================================================================================//
//                                EXPORTACIÓN                                         //
//====================================================================================//

export default FolderPickerButton;
