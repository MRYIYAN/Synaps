//====================================================================================//
//                                COMPONENTE FOLDER PICKER BUTTON                     //
//====================================================================================//

import React, { useRef } from 'react';
import ArchiveIcon from '../Icons/ArchiveIcon';

//====================================================================================//
//                                FUNCION PRINCIPAL                                   //
//====================================================================================//

/**
 * Botón para seleccionar una carpeta usando webkitdirectory.
 * @param {Function} onFolderSelected - Callback para devolver el nombre de la carpeta seleccionada.
 * @param {boolean} disabled - Si debe deshabilitar el botón.
 */
const FolderPickerButton = ({ onFolderSelected, disabled = false }) => {
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

  //---------------------------------------------// 
  // Manejar el cambio de carpeta seleccionada 
  //---------------------------------------------//
  const handleFolderChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const folderPath = files[0].webkitRelativePath.split('/')[0];
      onFolderSelected(folderPath);
    }
  };

  //====================================================================================//
  //                                RENDERIZADO                                         //
  //====================================================================================//

  return (
    <>
      {/* Botón para seleccionar carpeta */}
      <button
        type="button"
        className="icon-button"
        onClick={handleButtonClick}
        disabled={disabled}
        title="Seleccionar carpeta"
      >
        <ArchiveIcon size={20} />
      </button>

      {/* Input oculto para seleccionar carpeta */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFolderChange}
      />
    </>
  );
};

//====================================================================================//
//                                EXPORTACIÓN                                         //
//====================================================================================//

export default FolderPickerButton;
