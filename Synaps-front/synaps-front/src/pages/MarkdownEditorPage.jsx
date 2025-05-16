import React, { useEffect, useState } from "react";

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

  const note_id2 = 'wxQurJHajctZKfJbssDRueOm9BP9ENwR';

  return (
    <div className="layout-markdown-editor">
      <SidebarPanel />
      <div className="md-editor-wrapper">
        {note_id2
          ? <MDEditorWS note_id2={note_id2} />
          : <p style={{ padding: 20 }}>Selecciona una nota para editar</p>
        }
      </div>
    </div>
  );
}

export default MarkdownEditor;
