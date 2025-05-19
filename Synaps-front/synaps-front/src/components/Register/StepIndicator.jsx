//====================================================================================//
//                          INDICADOR DE PASOS DE REGISTRO                            //
//====================================================================================//
//  Este componente muestra el progreso del usuario en el proceso de registro         //
//  indicando visualmente en qué paso se encuentra y cuántos quedan.                  //
//====================================================================================//

import React from 'react';
import './StepIndicator.css';

// Íconos para cada paso
import { ReactComponent as UserIcon } from '../../assets/icons/user.svg';
import { ReactComponent as ProfileIcon } from '../../assets/icons/profile.svg';
import { ReactComponent as LockIcon } from '../../assets/icons/lock.svg';
import { ReactComponent as CheckIcon } from '../../assets/icons/check.svg';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const getStepIcon = (step, status) => {
    // Si el paso está completado, mostrar check
    if (status === 'completed') {
      return <CheckIcon className="step-icon check-icon" />;
    }
    
    // Si no, mostrar el icono correspondiente
    switch(step) {
      case 1:
        return <UserIcon className="step-icon" />;
      case 2:
        return <ProfileIcon className="step-icon" />;
      case 3:
        return <LockIcon className="step-icon" />;
      default:
        return null;
    }
  };
  
  const getStepLabel = (step) => {
    switch(step) {
      case 1:
        return 'Datos personales';
      case 2:
        return 'Perfil de usuario';
      case 3:
        return 'Seguridad';
      default:
        return '';
    }
  };
  
  return (
    <div className="step-indicator" data-completed={(currentStep - 1).toString()}>
      <div className="step-line"></div>
      {[...Array(totalSteps)].map((_, index) => {
        const step = index + 1;
        const status = step < currentStep 
          ? 'completed' 
          : step === currentStep 
            ? 'active' 
            : 'pending';
        
        return (
          <div 
            key={step} 
            className={`step ${status}`}
          >
            <div className="step-number">
              {getStepIcon(step, status)}
            </div>
            <div className="step-label">
              {getStepLabel(step)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;