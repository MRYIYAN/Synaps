// ----------------------------------------------------------------------
// auth.js
// Librería de funciones destinadas a realizar la autenticación de usuarios
// ----------------------------------------------------------------------

import { http_get } from './http.js';

/**
 * Comprueba si el access_token en localStorage sigue siendo válido.
 * - Si no hay token o el GET falla, redirigimos a /login.
 * - Si el GET es correcto, devuelve los datos del usuario.
 */
export async function loginCheck( navigate ) {

  // Capturamos el token de las cookies
  const token = localStorage.getItem( 'access_token' );

  // Si no existe el token, redirigimos al login
  if( !token ) {
    navigate( '/login', { replace: true } );
    throw new Error( 'Token not found' );
  }

  // Preparamos las cabeceras con el Token Bearer
  const headers = {
    'Authorization': 'Bearer ' + token
  };

  // Llamamos al helper http_get
  const { result, message, http_data } = await http_get(
      'http://localhost:8010/api/login-check'
    , headers
  );

  // Si el set es correcto, eliminamos el token de la cookie actual y redirigimos al login
  if( result === 0 ) {

    // Borramos la cookie
    localStorage.removeItem( 'access_token' );
    navigate( '/login', { replace: true } );
    throw new Error( message );
  }

  // Devolvemos datos del usuario
  return http_data.user;
}