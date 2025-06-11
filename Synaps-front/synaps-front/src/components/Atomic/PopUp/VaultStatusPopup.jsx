import React, { useEffect, useState } from 'react';
import { ReactComponent as LoadingSpinner } from "../../../assets/icons/loading-spinner.svg";
import { ReactComponent as CheckIcon } from "../../../assets/icons/check.svg";
import { ReactComponent as ErrorIcon } from "../../../assets/icons/fail.svg";
// Importamos el CSS desde la ubicación correcta en Atomic/styles
import '../styles/VaultStatusPopup.css';

/**
 * Estados posibles para la creación de la vault
 */
export const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * Componente PopUp que muestra el estado de la creación de una vault
 * @param {string} status - Estado actual (loading, success, error)
 * @param {string} message - Mensaje principal a mostrar
 * @param {string} errorMessage - Mensaje de error detallado (solo para estado ERROR)
 * @param {Function} onComplete - Función a ejecutar cuando se complete la animación
 * @param {number} autoCloseDelay - Tiempo en ms para cerrar automáticamente (0 para desactivar)
 */
const VaultStatusPopup = ({ 
  status = STATUS.LOADING, 
  message = "Creando vault...",
  errorMessage = "Ya existe una vault con ese nombre.",
  onComplete = () => {},
  autoCloseDelay = 2000
}) => {
  // Estado para controlar la animación de salida
  const [isExiting, setIsExiting] = useState(false);
  
  // Cerrar automáticamente después del tiempo especificado con animación de salida
  useEffect(() => {
    let timeoutId;
    let exitTimeoutId;
    
    if((status === STATUS.SUCCESS || status === STATUS.ERROR) && autoCloseDelay > 0) {
      // Iniciar animación de salida antes de que termine el tiempo completo
      timeoutId = setTimeout(() => {
        // Iniciar la animación de salida
        setIsExiting(true);
        
        // Esperar a que termine la animación antes de llamar a onComplete
        exitTimeoutId = setTimeout(() => {
          onComplete();
        }, 300); // Duración de la animación de salida
      }, autoCloseDelay - 300); // Restamos la duración de la animación
    }
    
    // Limpiar todos los timeouts al desmontar
    return () => {
      if(timeoutId) clearTimeout(timeoutId);
      if(exitTimeoutId) clearTimeout(exitTimeoutId);
    };
  }, [status, autoCloseDelay, onComplete]);
  
  // Obtener el icono apropiado según el estado
  const getStatusIcon = () => {
    switch (status) {
      case STATUS.SUCCESS:
        return <CheckIcon className="status-icon success" />;
      case STATUS.ERROR:
        return <ErrorIcon className="status-icon error" />;
      case STATUS.LOADING:
      default:
        return <LoadingSpinner className="status-icon loading animate-spin" />;
    }
  };
  
  // Calcular las clases CSS basadas en el estado y la animación
  const getPopupClasses = () => {
    const classes = ['vault-status-popup', status];
    
    // Añadir clase de animación de salida si corresponde
    if(isExiting) {
      classes.push('exiting');
    }
    
    return classes.join(' ');
  };
  
  return (
    <div className={getPopupClasses()}>
      <div className="status-icon-wrapper">
        {getStatusIcon()}
      </div>
      <div className="status-content">
        <p className="status-message">{message}</p>
        {status === STATUS.ERROR && (
          <p className="status-error-detail">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default VaultStatusPopup;