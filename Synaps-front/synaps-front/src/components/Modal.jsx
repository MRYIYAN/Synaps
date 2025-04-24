//===========================================================================//
//                             MODAL.JSX                                     
//===========================================================================//
//                                                                            //
//  Componente Modal con overlay y contenido centrado.                       //
//  Soporta cierre al clicar fuera o en el botón "×".                        //
//                                                                            //
//===========================================================================//

//===========================================================================//
//                             IMPORTS                                        
//===========================================================================//
import React from "react";
//import "./Modal.css";

//===========================================================================//
//                           COMPONENTE MODAL                                
//===========================================================================//
//                                                                            //
//  open: boolean para mostrar/ocultar.                                       //
//  onClose: función para cerrar el modal.                                   //
//                                                                            //
//===========================================================================//
const Modal = ({ open, onClose, children }) => {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()} // stopPropagation: evita que el clic en el contenido cierre el modal.
            >
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

//===========================================================================//
//                             EXPORTACIÓN                                   
//===========================================================================//
export default Modal;
