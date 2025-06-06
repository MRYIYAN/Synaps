module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Desactivar reglas que pueden causar conflictos
    'react/no-unused-vars': 'off',
    'no-unused-vars': 'warn'
  }
};
