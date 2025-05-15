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
import MDEditor from "../components/MarkdownEditor/MDEditor";

// ------------------------------------------------------------
// APP
// ------------------------------------------------------------

const MarkdownEditor = function() {
  return (
    <div className="layout-markdown-editor">
      <SidebarPanel />
      <div className="md-editor-wrapper">
        <MDEditor />
      </div>
    </div>
  );
}

export default MarkdownEditor;
