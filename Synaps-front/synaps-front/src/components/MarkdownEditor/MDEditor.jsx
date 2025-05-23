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

export default function MDEditor( { markdown, onChange, options = true } ) {
  
  // Plugins comunes a siempre incluir
  const basePlugins = [
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
    listsPlugin(),
    linkPlugin(),
    quotePlugin(),
    tablePlugin({ floatingToolbar: 'hover' }),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
    codeMirrorPlugin({
      codeBlockLanguages: { js: 'JavaScript' },
      autoLoadLanguageSupport: false
    }),
    markdownShortcutPlugin()
  ];

  // Si options está habilitado, agregamos toolbarPlugin
  const plugins = options
    ? [
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
        ...basePlugins
      ]
    : basePlugins;

  return (
    <div className='mdx-obsidian dark h-full w-full'>
      <MDXEditor
        markdown={markdown ?? ''}
        onChange={onChange}
        className='obsidian-theme'
        plugins={plugins}
      />
    </div>
  )
}
