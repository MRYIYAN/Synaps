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

import React, { useState } from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  frontmatterPlugin,
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

  const initialMarkdown =
`
# Título principal

## Subtítulo

- Ítem de lista
- [ ] Tarea pendiente
- [x] Tarea completada

| Col1 | Col2 |
|------|------|
| A    | B    |

\`\`\`js
// Bloque de código
console.log('Hola mundo')
\`\`\`

**negrita** _cursiva_ ~~tachado~~

> Esto es una cita.

[Enlace externo](https://obsidian.md)

---

![Imagen de ejemplo](https://placekitten.com/200/300)
`

export default function MDEditor () {

  const [markdown, setMarkdown] = useState(initialMarkdown);

  return (
    <div className='mdx-obsidian dark h-full w-full'>
      <MDXEditor
        markdown={markdown}
        onChange={setMarkdown}
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
