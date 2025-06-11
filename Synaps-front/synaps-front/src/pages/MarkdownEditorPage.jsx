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

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const MarkdownEditor = function() {
  const { note_id2 } = useParams();
  const [selectedNoteId2, setSelectedNoteId2] = useState(note_id2 || '');
  const [selectedVaultId, setSelectedVaultId] = useState(window.currentVaultId || null);

  useEffect(() => {
    const noteSelectedHandler = (e) => {
      const { note_id2, vault_id } = e.detail;
      setSelectedNoteId2(note_id2);
      setSelectedVaultId(vault_id);
    };

    const noteDeletedHandler = (e) => {
      const { deletedNoteId2 } = e.detail;
      if (deletedNoteId2 === selectedNoteId2) {
        setSelectedNoteId2('');
        setSelectedVaultId(null);
      }
    };

    //  Mostrar el JWT desde localStorage en consola
    const jwt = localStorage.getItem('access_token');
    console.debug('[MarkdownEditor.jsx] JWT desde localStorage:', jwt);

    window.addEventListener('noteSelected', noteSelectedHandler);
    window.addEventListener('noteDeleted', noteDeletedHandler);
    
    return () => {
      window.removeEventListener('noteSelected', noteSelectedHandler);
      window.removeEventListener('noteDeleted', noteDeletedHandler);
    };
  }, [selectedNoteId2]);

  return (
    <div className="layout-markdown-editor">
      <SidebarPanel defaultSelectedItem="files" />
      <div className="md-editor-wrapper">
        <MDEditorWS note_id2={selectedNoteId2} vault_id={selectedVaultId} />
      </div>
    </div>
  );
}

export default MarkdownEditor;
