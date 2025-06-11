import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

/*
import Button     from "../components/Button";
import Card       from "../components/Card";
import LoginForm  from "../components/LoginForm";
import Modal      from "../components/Modal";
*/

import SidebarPanel from "../components/SidebarPanel";
import MDEditorWS from "../components/MarkdownEditor/MDEditorWS";
import AppTour from "../components/Tour/AppTour";
import { http_get } from '../lib/http.js';
import { MultiUserButton } from "../components/Atomic/Multiuser/MultiUser";

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const MarkdownEditor = function() {

  // ---------------------------------------------------------------------------
  // Tour
  // ---------------------------------------------------------------------------

  const [runTour, setRunTour] = useState( false );

  useEffect( () => {
    let value = true;
    
    const token = localStorage.getItem( "access_token" ); 
    if( token ) {
      console.log( "Access Token JWT:", token ); 
      // Verificar si es el primer login del usuario
      checkFirstLogin();
    } else {
      console.warn( "No token found in localStorage." );
    }
    
    return value;
  }, [] );

  useEffect( () => {
    let value = true;
    
    console.log( "All localStorage keys:", Object.keys( localStorage ) ); // Muestra todas las claves de localStorage
    
    return value;
  }, [] );

  const checkFirstLogin = async () => {
    let value = false;
    
    try {
      // Limpiar el estado del tour para pruebas
      localStorage.removeItem( "tour_completed" );
      
      // Verificar si ya se completó el tour en esta sesión
      const tourCompletedLocal = localStorage.getItem( "tour_completed" );
      if( tourCompletedLocal === "true" ) {
        value = false;
        return value;
      }

      // Hacer petición al backend para verificar el primer login usando UserController
      const url = 'http://localhost:8010/api/user/first-login';
      const { result, http_data } = await http_get( url );

      if( result === 1 && http_data ) {
        // Verificar si es el primer login
        if( http_data.first_login === true ) {
          // Pequeño delay para asegurar que todos los componentes estén montados
          setTimeout( () => {
            setRunTour( true );
          }, 1000 );
          value = true;
        }
      }
    } catch( error ) {
      console.error( "Error checking first login:", error );
      value = false;
    }
    
    return value;
  };

  const handleTourFinish = () => {
    let value = true;
    
    setRunTour( false );
    // Guardar en localStorage que el tour fue completado
    localStorage.setItem( "tour_completed", "true" );
    
    return value;
  };

  const { note_id2 } = useParams();
  const [selectedNoteId2, setSelectedNoteId2] = useState( note_id2 || '' );
  const [selectedVaultId, setSelectedVaultId] = useState( window.currentVaultId || null );

  useEffect( () => {
    const noteSelectedHandler = ( e ) => {
      const { note_id2, vault_id } = e.detail;
      setSelectedNoteId2( note_id2 );
      setSelectedVaultId( vault_id );
    };

    const noteDeletedHandler = ( e ) => {
      const { deletedNoteId2 } = e.detail;

      // Si la nota eliminada es la que está actualmente abierta, 
      // limpiamos la selección para mostrar el menú de VS Code
      if( deletedNoteId2 === selectedNoteId2 ) {
        setSelectedNoteId2( '' );
        setSelectedVaultId( null );
      }
    };

    window.addEventListener( 'noteSelected', noteSelectedHandler );
    window.addEventListener( 'noteDeleted', noteDeletedHandler );
    
    return () => {
      window.removeEventListener( 'noteSelected', noteSelectedHandler );
      window.removeEventListener( 'noteDeleted', noteDeletedHandler );
    };
  }, [selectedNoteId2] );

  return (
    <>
      <div className="layout-markdown-editor">
        <SidebarPanel />
        <div className="md-editor-wrapper">
          <MDEditorWS note_id2={selectedNoteId2} vault_id={selectedVaultId} />
          {selectedNoteId2 && (
            <MultiUserButton documentTitle="Documento de Synaps" />
          )}
        </div>
        
        {/* Tour Component */}
        <AppTour run={runTour} onFinish={handleTourFinish} />
      </div>
    </>
  );
}

export default MarkdownEditor;
