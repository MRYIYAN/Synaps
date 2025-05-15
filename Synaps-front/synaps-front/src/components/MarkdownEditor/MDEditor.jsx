/**
 * @file MDEditor.jsx
 * @description Componente React que renderiza un editor Markdown interactivo
 *              basado en la librería @mdxeditor/editor.
 *
 * @returns {JSX.Element} Un editor Markdown con soporte para encabezados, listas,
 *                       enlaces, citas, tablas, atajos y formato en tiempo real.
 *
 * @details
 * - Inicializa el estado local 'markdown' con un texto de ejemplo.
 * - Permite al usuario escribir y formatear contenido Markdown en tiempo real.
 * - Soporta bloques de código, listas, tablas, encabezados, enlaces y más.
 * - Incluye plugins para atajos y diferentes tipos de contenido.
 * - Requiere los estilos de '@mdxeditor/editor' y un CSS propio opcional.
 */

import React, { useState, useEffect } from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  InsertTable,
  InsertCodeBlock,
  UndoRedo
} from '@mdxeditor/editor'

import '@mdxeditor/editor/style.css'
import './MDEditor.css'
import './obsidian.css'

export default function MDEditor () {

  // markdown -> Contenido visible en el editor
  // noteKey -> Clave única. Al cambiarla fuerza a React a desmontar y montar de nuevo el componente MDXEditor
  const [markdown, setMarkdown] = useState( '' );
  const [noteKey, setNoteKey]   = useState( 0 );

  useEffect( () => {
    // Cargar una nota completa.
    // - Guarda una copia en window.markdown
    // - Actualiza el estado local
    // - Incrementa noteKey para obligar al remount del editor
    window.loadMarkdown = content => {

      // Guardamos la copia
      const safe = typeof content === 'string' ? content : '';
      window.markdown = safe;
      setMarkdown( safe );

      // Remount de MDEditor
      setNoteKey( k => k + 1 );
    };

    // Actualizar mientras el usuario escribe.
    // Igual que arriba pero SIN modificar noteKey, de modo que el editor no se desmonta en cada pulsación.
    window.updateMarkdown = content => {
      const safe = typeof content === 'string' ? content : '';
      window.markdown = safe;
      setMarkdown( safe );
    };

    // Valor inicial accesible globalmente
    window.markdown = markdown;
  }, [] );

  return (
    <div className='mdx-obsidian dark h-full w-full'>
      <MDXEditor
        key={noteKey}
        markdown={markdown ?? ''}
        onChange={window.updateMarkdown}
        className='obsidian-theme'
        plugins={[
          headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          tablePlugin({
            floatingToolbar: 'hover'
          }),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }), // Fijamos JS por defecto
          codeMirrorPlugin({
            codeBlockLanguages: { js: 'JavaScript' },
            autoLoadLanguageSupport: false
          }),
          toolbarPlugin({
            sticky: true,
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <ListsToggle />
                <InsertCodeBlock />
                <InsertTable />
              </>
            )
          }),
          markdownShortcutPlugin()
        ]}
      />
    </div>
  )
}
