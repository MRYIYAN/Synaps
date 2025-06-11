// -------------------------------------------------------------------------
// NotificationSystem.jsx - Sistema de notificaciones para errores HTTP
// -------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import { ReactComponent as ErrorIcon } from '../../../assets/icons/fail.svg';
import { ReactComponent as WarningIcon } from '../../../assets/icons/question.svg';
import { ReactComponent as InfoIcon } from '../../../assets/icons/check.svg';
import { ReactComponent as CloseIcon } from '../../../assets/icons/close.svg';

/**
 * Sistema de notificaciones para mostrar errores HTTP y otros mensajes
 * Se posiciona en la esquina superior derecha con animaciones
 */
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // Función para remover una notificación
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Función para agregar una nueva notificación
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'error', // por defecto
      title: 'Error',
      message: 'Ha ocurrido un error',
      duration: 5000, // 5 segundos por defecto
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, [removeNotification]);

  // Exponer funciones globalmente para uso desde http.js
  useEffect(() => {
    window.showNotification = addNotification;
    window.hideNotification = removeNotification;

    return () => {
      delete window.showNotification;
      delete window.hideNotification;
    };
  }, [addNotification, removeNotification]);

  // Función para obtener el icono según el tipo
  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon className="notification-icon" />;
      case 'warning':
        return <WarningIcon className="notification-icon" />;
      case 'info':
        return <InfoIcon className="notification-icon" />;
      default:
        return <ErrorIcon className="notification-icon" />;
    }
  };

  if(notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <div className="notification-icon-wrapper">
              {getIcon(notification.type)}
            </div>
            <div className="notification-text">
              <h4 className="notification-title">{notification.title}</h4>
              <p className="notification-message">{notification.message}</p>
            </div>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Cerrar notificación"
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
};

// Funciones helper para mostrar notificaciones específicas
export const showErrorNotification = (message, title = 'Error') => {
  if(window.showNotification) {
    window.showNotification({
      type: 'error',
      title,
      message,
      duration: 5000
    });
  }
};

export const showWarningNotification = (message, title = 'Advertencia') => {
  if(window.showNotification) {
    window.showNotification({
      type: 'warning',
      title,
      message,
      duration: 4000
    });
  }
};

export const showInfoNotification = (message, title = 'Información') => {
  if(window.showNotification) {
    window.showNotification({
      type: 'info',
      title,
      message,
      duration: 3000
    });
  }
};

export default NotificationSystem;
