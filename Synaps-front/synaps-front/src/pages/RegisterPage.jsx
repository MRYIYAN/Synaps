//====================================================================================//
//                        PÁGINA DE REGISTRO DE USUARIO EN SYNAPS                     //
//====================================================================================//
//  Este componente implementa un formulario de registro de 3 pasos que permite       //
//  a los usuarios crear una cuenta en Synaps con todos sus datos.                    //
//  Los pasos son:                                                                    //
//  1. Datos personales: nombre, correo, fecha de nacimiento                          //
//  2. Datos de usuario: nombre de usuario, foto de perfil, biografía, privacidad     //
//  3. Contraseña y seguridad: contraseña, pregunta de seguridad, términos            //
//====================================================================================//

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------
import StepIndicator from '../components/Register/StepIndicator';
import PersonalDataForm from '../components/Register/PersonalDataForm';
import UserDataForm from '../components/Register/UserDataForm';
import PasswordForm from '../components/Register/PasswordForm';

// Logo y estilos
import { ReactComponent as SynapsLogo } from '../assets/icons/logo_header_sidebar.svg';
import '../styles/RegisterPage.css';

// ------------------------------------------------------------
// Componente RegisterPage
// ------------------------------------------------------------

const RegisterPage = function() {
  const navigate = useNavigate();
  
  // Referencias para los campos con foco automático
  const nameInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // Estado para controlar el paso actual
  const [currentStep, setCurrentStep] = useState(1);
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Datos personales
    fullName: '',
    email: '',
    birthDate: '',
    gender: '',
    
    // Paso 2: Datos de usuario
    username: '',
    profilePicture: null,
    bio: '',
    privacySettings: {
      profileVisibility: 'public'
    },
    
    // Paso 3: Contraseña y seguridad
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    termsAccepted: false
  });
  
  // Estado para errores de validación
  const [errors, setErrors] = useState({});
  
  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Efecto para manejar el foco automático según el paso
  useEffect(() => {
    // Pequeño timeout para asegurar que los elementos estén renderizados
    setTimeout(() => {
      if (currentStep === 1 && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (currentStep === 2 && usernameInputRef.current) {
        usernameInputRef.current.focus();
      } else if (currentStep === 3 && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }, 100);
  }, [currentStep]);
  
  // Manejador para actualizar los datos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Manejar diferentes tipos de inputs
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar errores al cambiar un valor
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Manejador para objetos anidados
  const handleNestedChange = (parent, name, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value
      }
    }));
  };
  
  // Manejador para archivos
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo (solo imágenes)
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'El archivo debe ser una imagen'
        }));
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'La imagen no puede superar los 2MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      // Limpiar error si existía
      if (errors.profilePicture) {
        setErrors(prev => ({
          ...prev,
          profilePicture: null
        }));
      }
    }
  };
  
  // Funciones de validación detalladas
  
  // Validar nombre completo
  const validateFullName = (name) => {
    if (!name.trim()) {
      return 'El nombre completo es obligatorio';
    }
    if (name.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    // Regex para validar que solo contenga letras, espacios y algunos caracteres especiales
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
      return 'El nombre solo puede contener letras, espacios, apóstrofes y guiones';
    }
    return null;
  };
  
  // Validar email
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'El correo electrónico es obligatorio';
    }
    // Regex básico para validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El formato del correo electrónico no es válido';
    }
    return null;
  };
  
  // Validar fecha de nacimiento
  const validateBirthDate = (date) => {
    if (!date) {
      return 'La fecha de nacimiento es obligatoria';
    }
    
    const birthDate = new Date(date);
    const today = new Date();
    
    // Verificar que sea una fecha válida
    if (isNaN(birthDate.getTime())) {
      return 'La fecha de nacimiento no es válida';
    }
    
    // Verificar que no sea una fecha futura
    if (birthDate > today) {
      return 'La fecha de nacimiento no puede ser futura';
    }
    
    // Verificar edad mínima (13 años)
    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
    if (birthDate > minAgeDate) {
      return 'Debes tener al menos 13 años para registrarte';
    }
    
    return null;
  };
  
  // Validar nombre de usuario
  const validateUsername = (username) => {
    if (!username.trim()) {
      return 'El nombre de usuario es obligatorio';
    }
    if (username.trim().length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (username.trim().length > 20) {
      return 'El nombre de usuario no puede tener más de 20 caracteres';
    }
    // Regex para validar que solo contenga letras, números, guiones y guiones bajos
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos';
    }
    return null;
  };
  
  // Validar biografía
  const validateBio = (bio) => {
    if (bio.length > 500) {
      return 'La biografía no puede superar los 500 caracteres';
    }
    return null;
  };
  
  // Validar contraseña
  const validatePassword = (password) => {
    if (!password) {
      return 'La contraseña es obligatoria';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    // Validar que contenga al menos una letra mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;
    if (!passwordRegex.test(password)) {
      return 'La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número';
    }
    return null;
  };
  
  // Validar confirmación de contraseña
  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return 'Debes confirmar la contraseña';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };
  
  // Validar pregunta de seguridad
  const validateSecurityQuestion = (question, answer) => {
    if (question && !answer.trim()) {
      return 'Debes proporcionar una respuesta a la pregunta de seguridad';
    }
    return null;
  };
  
  // Validación específica para cada paso
  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;
    
    switch(step) {
      case 1:
        // Validar nombre
        const fullNameError = validateFullName(formData.fullName);
        if (fullNameError) {
          stepErrors.fullName = fullNameError;
          isValid = false;
        }
        
        // Validar email
        const emailError = validateEmail(formData.email);
        if (emailError) {
          stepErrors.email = emailError;
          isValid = false;
        }
        
        // Validar fecha de nacimiento
        const birthDateError = validateBirthDate(formData.birthDate);
        if (birthDateError) {
          stepErrors.birthDate = birthDateError;
          isValid = false;
        }
        break;
        
      case 2:
        // Validar nombre de usuario
        const usernameError = validateUsername(formData.username);
        if (usernameError) {
          stepErrors.username = usernameError;
          isValid = false;
        }
        
        // Validar biografía si existe
        if (formData.bio) {
          const bioError = validateBio(formData.bio);
          if (bioError) {
            stepErrors.bio = bioError;
            isValid = false;
          }
        }
        break;
        
      case 3:
        // Validar contraseña
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          stepErrors.password = passwordError;
          isValid = false;
        }
        
        // Validar confirmación de contraseña
        const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
        if (confirmError) {
          stepErrors.confirmPassword = confirmError;
          isValid = false;
        }
        
        // Validar pregunta de seguridad si se ha seleccionado
        const securityAnswerError = validateSecurityQuestion(
          formData.securityQuestion, 
          formData.securityAnswer
        );
        if (securityAnswerError) {
          stepErrors.securityAnswer = securityAnswerError;
          isValid = false;
        }
        
        // Validar términos
        if (!formData.termsAccepted) {
          stepErrors.termsAccepted = 'Debes aceptar los términos y condiciones';
          isValid = false;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      ...stepErrors
    }));
    
    return isValid;
  };
  
  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      
      // Mostrar animación de transición
      document.querySelector('.register-form-container').classList.add('transitioning');
      setTimeout(() => {
        document.querySelector('.register-form-container').classList.remove('transitioning');
      }, 300);
    }
  };
  
  // Retroceder al paso anterior
  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    
    // Mostrar animación de transición
    document.querySelector('.register-form-container').classList.add('transitioning-back');
    setTimeout(() => {
      document.querySelector('.register-form-container').classList.remove('transitioning-back');
    }, 300);
  };
  
  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar el último paso antes de enviar
    if (!validateStep(3)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implementar lógica de registro con la API
      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitResult({
        success: true,
        message: 'Registro completado con éxito'
      });
      
      // Redirección después del registro exitoso
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Error al registrar: ' + (error.message || 'Inténtalo de nuevo')
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Manejar eventos de teclado para navegación
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      if (currentStep < 3) {
        // Al presionar Enter, avanzar al siguiente paso
        handleNext();
      } else if (currentStep === 3) {
        // En el último paso, enviar el formulario
        handleSubmit(e);
      }
    }
  };
  
  // Renderizar el formulario del paso actual
  const renderStepForm = () => {
    switch(currentStep) {
      case 1:
        return (
          <PersonalDataForm 
            formData={formData} 
            errors={errors} 
            onChange={handleChange}
            onNext={handleNext}
            nameInputRef={nameInputRef}
          />
        );
      case 2:
        return (
          <UserDataForm 
            formData={formData} 
            errors={errors} 
            onChange={handleChange}
            onFileChange={handleFileChange}
            onNestedChange={handleNestedChange}
            onNext={handleNext}
            onPrev={handlePrev}
            usernameInputRef={usernameInputRef}
          />
        );
      case 3:
        return (
          <PasswordForm 
            formData={formData} 
            errors={errors} 
            onChange={handleChange}
            onPrev={handlePrev}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitResult={submitResult}
            passwordInputRef={passwordInputRef}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="register-page" onKeyDown={handleKeyDown}>
      <div className="register-container">
        <div className="register-header">
          <SynapsLogo className="register-logo" />
          <h1 className="register-title">Crear cuenta</h1>
        </div>
        
        <StepIndicator currentStep={currentStep} totalSteps={3} />
        
        <div className="register-form-container">
          {renderStepForm()}
        </div>
        
        <div className="register-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="register-link">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
