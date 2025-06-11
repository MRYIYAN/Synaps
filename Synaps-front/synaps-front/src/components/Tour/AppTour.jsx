import React, { useState, useEffect } from 'react';
import './AppTour.css';

const AppTour = ({ run, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      target: '.sidebar-panel',
      content: '¡Bienvenido a Synaps! Este es el panel lateral donde encontrarás todas las opciones principales de la aplicación.',
      title: 'Panel de navegación',
    },
    {
      target: '.main-navigation li:first-child',
      content: 'Este es el panel de archivos donde puedes ver y organizar todas tus notas y carpetas.',
      title: 'Panel de archivos',
    },
    {
      target: '.main-navigation li:nth-child(2)',
      content: 'La Vista Galaxia te permite explorar tus notas de forma visual e interactiva.',
      title: 'Vista Galaxia',
    },
    {
      target: '.main-navigation li:nth-child(3)',
      content: 'Aquí puedes gestionar tu lista de tareas pendientes.',
      title: 'Lista de tareas',
    },
    {
      target: '.user-profile-bar',
      content: 'En esta sección puedes cambiar entre tus diferentes bóvedas de notas y acceder a tu perfil.',
      title: 'Perfil y Vaults',
    },
    {
      target: '.vault-section',
      content: 'Haz clic aquí para seleccionar o crear nuevas bóvedas de notas.',
      title: 'Selector de Vaults',
    },
    {
      target: '.logout-item',
      content: 'Desde aquí puedes cerrar tu sesión de forma segura.',
      title: 'Cerrar sesión',
    },
    {
      target: null, // Sin target específico
      content: '¡Felicidades! Has completado el tour de Synaps. Ahora puedes explorar todas las funciones de la aplicación y crear tus primeras notas. ¡Disfruta de la experiencia Synaps!',
      title: '¡Bienvenido a Synaps!',
    },
  ];

  useEffect(() => {
    if (run) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [run]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    setIsVisible(false);
    if (onFinish) {
      onFinish();
    }
  };

  const getTooltipPosition = (targetSelector) => {
    // Si no hay target (último paso), centrar en pantalla
    if (!targetSelector) {
      return {
        top: `${window.innerHeight / 2 - 150}px`,
        left: `${window.innerWidth / 2 - 190}px`,
      };
    }

    const target = document.querySelector(targetSelector);
    if (!target) return { top: '50%', left: '50%' };

    const rect = target.getBoundingClientRect();
    let tooltip = {
      top: rect.top + rect.height / 2,
      left: rect.right + 20,
    };

    // Ajuste específico para el paso de usuarios (perfil y vaults) - posición más arriba
    if (targetSelector === '.user-profile-bar') {
      tooltip.top = rect.top - 250; // Mueve el tooltip 250px más arriba
    }

    // Ajustar si se sale de la pantalla
    if (tooltip.left + 380 > window.innerWidth) {
      tooltip.left = rect.left - 400;
    }

    if (tooltip.top + 250 > window.innerHeight) {
      tooltip.top = window.innerHeight - 270;
    }

    // Asegurar que no se salga por arriba
    if (tooltip.top < 20) {
      tooltip.top = 20;
    }

    return {
      top: `${tooltip.top}px`,
      left: `${tooltip.left}px`,
    };
  };

  const highlightTarget = (targetSelector) => {
    // Remover highlight anterior
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    // Si no hay target (último paso), no agregar highlight
    if (!targetSelector) {
      return;
    }

    // Agregar highlight al elemento actual
    const target = document.querySelector(targetSelector);
    if (target) {
      target.classList.add('tour-highlight');
    }
  };

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      highlightTarget(steps[currentStep].target);
    }

    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentStep, isVisible, steps]);

  if (!isVisible || !steps[currentStep]) return null;

  const position = getTooltipPosition(steps[currentStep].target);
  const isLastStep = currentStep === steps.length - 1;
  const isCenteredStep = !steps[currentStep].target; // Sin target = centrado

  return (
    <>
      <div className="tour-overlay" onClick={handleSkip} />
      <div className={`tour-tooltip ${isCenteredStep ? 'centered' : ''}`} style={position}>
        <div className="tour-tooltip-header">
          <h3>{steps[currentStep].title}</h3>
          <button className="tour-close" onClick={handleSkip}>×</button>
        </div>
        <div className="tour-tooltip-content">
          <p>{steps[currentStep].content}</p>
        </div>
        <div className="tour-tooltip-footer">
          <div className="tour-progress">
            <span>{currentStep + 1} de {steps.length}</span>
          </div>
          <div className="tour-buttons">
            {currentStep > 0 && (
              <button className="tour-button tour-button-secondary" onClick={handlePrev}>
                Atrás
              </button>
            )}
            <button className="tour-button tour-button-skip" onClick={handleSkip}>
              Omitir tour
            </button>
            <button className="tour-button tour-button-primary" onClick={handleNext}>
              {isLastStep ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppTour;
