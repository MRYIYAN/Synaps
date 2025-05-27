import { useParams } from 'react-router-dom';

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
  const vault_id = window.currentVaultId || null;

  return (
    <div className="layout-markdown-editor">
      <SidebarPanel />
      <div className="md-editor-wrapper">
        <MDEditorWS note_id2={note_id2 || ''} vault_id={vault_id} />
      </div>
    </div>
  );
}

export default MarkdownEditor;
