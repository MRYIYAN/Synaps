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
    const handler = (e) => {
      const { note_id2, vault_id } = e.detail;
      setSelectedNoteId2(note_id2);
      setSelectedVaultId(vault_id);
    };

    window.addEventListener('noteSelected', handler);
    return () => window.removeEventListener('noteSelected', handler);
  }, []);

  return (
    <div className="layout-markdown-editor">
      <SidebarPanel />
      <div className="md-editor-wrapper">
        <MDEditorWS note_id2={selectedNoteId2} vault_id={selectedVaultId} />
      </div>
    </div>
  );
}

export default MarkdownEditor;
