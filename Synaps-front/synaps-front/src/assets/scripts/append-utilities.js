/*======================================================================================*/
/*                                APPEND UTILITIES.JS                                   */
/*======================================================================================*/

/**
 * Este script agrega automáticamente utilidades CSS tipo Tailwind a un archivo global ya existente,
 * en este caso `global.css`. Está pensado para proyectos como Synaps, donde se busca tener un sistema
 * de clases utilitarias personalizadas (basadas en rem) sin usar Tailwind directamente.
 *
 * El script no borra ni reemplaza el contenido actual del CSS, solo añade clases nuevas al final:
 * - Espaciado (padding, margin, top, bottom, left, right)
 * - Flexbox (flex, justify, align)
 * - Ancho y alto (width/height en rem)
 *
 * Para usarlo, solo ejecutá `node scripts/append-utilities.js` y se actualizará automáticamente tu CSS.
 * Asegurate de tener Node.js instalado y de que `global.css` esté en la ruta correcta.
 */

// Importa el módulo de filesystem de Node.js para leer y escribir archivos
const fs = require('fs'); 

// Ruta del archivo CSS donde se añadirán las utilidades.
const path = '../styles/global.css'; // NO TOCAR!

// Array de valores de espaciado en rem (como Tailwind, pero personalizados)
const spacing = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6];

// Convierte un número a string en rem, ej: 1.25 -> "1.25rem"
const rem = (value) => `${value}rem`;

// Genera clases de espaciado para propiedades como margin o padding
// prefix es el nombre de clase (ej: "pt", "pl", "m", etc.)
const generateSpacing = (prop, prefix) =>
  spacing.map(
    (val) =>
      `.${prefix}-${val.toString().replace('.', '_')} { ${prop}: ${rem(val)} !important; }`
  ).join('\n');

// Clases para flexbox, centrado, distribución de elementos, etc.
const generateFlex = () => `
/* === FLEX === */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }

.items-start    { align-items: flex-start; }
.items-center   { align-items: center; }
.items-end      { align-items: flex-end; }
.items-stretch  { align-items: stretch; }

.justify-start   { justify-content: flex-start; }
.justify-center  { justify-content: center; }
.justify-end     { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around  { justify-content: space-around; }
.justify-evenly  { justify-content: space-evenly; }
`;

// Genera clases para tamaños fijos de ancho y alto (ej: w-48 -> 12rem)
const generateSizes = () => {
  const steps = [1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64];
  return steps.map(
    (val) => [
      `.w-${val} { width: ${rem(val)} !important; }`,
      `.h-${val} { height: ${rem(val)} !important; }`
    ].join('\n')
  ).join('\n');
};

// Función principal del script
const main = () => {
  // Verifica si el archivo existe
  if (!fs.existsSync(path)) {
    console.error(`❌ No se encontró ${path}`);
    return;
  }

  // Bloque CSS completo generado dinámicamente
  const generatedCSS = `
/* === AUTO-GENERATED UTILITIES === */
${generateSpacing('margin', 'm')}
${generateSpacing('padding', 'p')}
${generateSpacing('margin-top', 'mt')}
${generateSpacing('padding-top', 'pt')}
${generateSpacing('margin-bottom', 'mb')}
${generateSpacing('padding-bottom', 'pb')}
${generateSpacing('margin-left', 'ml')}
${generateSpacing('padding-left', 'pl')}
${generateSpacing('margin-right', 'mr')}
${generateSpacing('padding-right', 'pr')}

${generateFlex()}

${generateSizes()}
/* === END AUTO-GENERATED === */
`;

// Añade el bloque generado al final del archivo global.css
  fs.appendFileSync(path, generatedCSS.trimStart());
  console.log(`✅ Utilidades añadidas a ${path}`);
};

main();
