//===========================================================================   //
//                       MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN              //
//===========================================================================   //
//  Este componente implementa un modal que se muestra al intentar cerrar       //
//  sesión. Utiliza animaciones CSS estándar y la fuente IBM Plex Sans.         //
//===========================================================================   //

//===========================================================================//
//                             IMPORTS                                       //
//===========================================================================//
import React, { useEffect } from "react";
import { ReactComponent as LogoutIcon } from "../../../assets/icons/logout.svg";
//===========================================================================//

//===========================================================================//
//                      COMPONENTE LOGOUTCONFIRMMODAL                        //
//===========================================================================//
const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  //---------------------------------------------------------------------------//
  //  Efectos para gestionar animaciones y comportamiento del modal            //
  //---------------------------------------------------------------------------//
  useEffect(() => {
    // Handler para cerrar con tecla Escape
    const handleEscKey = (event) => {
      if(event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    // Control del estado de la página cuando se abre el modal
    if(isOpen) {
      // Añadimos la clase para evitar el scroll en el body mientras el modal está abierto
      document.body.classList.add("modal-open");
      
      // Enfocamos el primer botón al abrir para mejorar la accesibilidad
      setTimeout(() => {
        const closeButton = document.querySelector(".modal-close-btn");
        if(closeButton) closeButton.focus();
      }, 100);
      
      // Añadimos el event listener para tecla Escape
      document.addEventListener("keydown", handleEscKey);
    } else {
      // Eliminamos la clase cuando se cierra el modal
      document.body.classList.remove("modal-open");
    }

    // Limpieza del efecto
    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, onClose]);

  //---------------------------------------------------------------------------//
  //  Handlers para interacciones del usuario                                 //
  //---------------------------------------------------------------------------//
  // Función para manejar la confirmación del cierre de sesión
  const handleConfirm = () => {
    // TODO: Implementar la funcionalidad completa de cierre de sesión
    // - Integrar con el sistema de autenticación (Firebase, Auth0, etc.)
    // - Invalidar tokens JWT en el servidor
    // - Limpiar datos de sesión del localStorage/sessionStorage
    // - Registrar evento de cierre de sesión para analytics
    // - Redirigir al usuario a la página de login
    // - Mostrar notificación de cierre de sesión exitoso
    
    onConfirm();
  };

  // Función para detener la propagación de clics dentro del modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  //---------------------------------------------------------------------------//
  //  Renderizado condicional del modal                                       //
  //---------------------------------------------------------------------------//
  // Si no está abierto, no renderizar nada
  if(!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div 
        className="modal-content logout-modal font-ibm"
        onClick={handleModalContentClick}
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Cerrar diálogo"
        >
          {/* Usamos un símbolo × como botón de cierre */}
          ×
        </button>
        
        <div className="modal-icon-container">
          <LogoutIcon className="modal-icon" />
        </div>
        
        <h2 id="logout-title" className="modal-title">
          ¿Cerrar sesión?
        </h2>
        
        <p className="modal-description">
          ¿Estás seguro de que deseas cerrar la sesión? 
          Se perderán los cambios no guardados.
        </p>
        
        <div className="modal-buttons">
          <button 
            className="modal-button secondary" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="modal-button primary" 
            onClick={handleConfirm}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;