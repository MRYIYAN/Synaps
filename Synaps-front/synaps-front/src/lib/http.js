// ----------------------------------------------------------------------
// http.js
// Librería de funciones destinadas a ejecutar llamadas por HTTP
// ----------------------------------------------------------------------

export async function http_post( url, body, headers, credentials = 'include' ) {

  // Inicializamos los valores a devolver
  let result    = 0;
  let message   = '';
  let value     = [];
  let http_data = [];

  try {
    
    // Si no se han especificado cabeceras, insertamos las de JSON por defecto
    if( !headers ) {
      headers = {
          'Content-Type': 'application/json'
        , Accept        : 'application/json'
      }; 
    }

    // Ejecutamos la solicitud a la ruta backend especificada
    let http_response = await fetch( url, {
        method     : 'POST'
      , headers    : headers
      , body       : JSON.stringify( body )
      , credentials: credentials
    } );

    // Capturamos los datos de la petición
    http_data = await http_response.json();

    // Si la petición ha sido incorrecta, salimos del flujo
    if( !http_response.ok )
      message = http_data.message || http_response.statusText || 'Error';

    // Caso de éxito
    else {
      result  = 1;
      message = http_data.message || 'OK';
    }

  } catch( error ) {

    // Mensaje de error
    message = error.message || 'Network error';
  }
  finally
  {
    // Calculamos el array a devolver
    value = { result, message, http_data };
    return value;
  }

}

// Helper para GET con Bearer
export async function http_get( url, body = {}, headers = {}, credentials = 'include' ) {

  // Inicializamos el valor a devolver
  let result    = 0;
  let message   = '';
  let http_data = [];

  try {

    // Si no se han especificado cabeceras, insertamos las de JSON por defecto
    if( !headers ) {
      headers = {
        Accept: 'application/json'
      };
    }

    // Calculamos la URL final
    const params = new URLSearchParams( body ).toString();
    if( params.length > 0 )
      url += '?' + params;

    // Ejecutamos la solicitud GET a la ruta backend especificada
    let http_response = await fetch( url, {
        method     : 'GET'
      , headers    : headers
      , credentials: credentials
    } );

    // Capturamos los datos de la respuesta
    http_data = await http_response.json();

    // Si la petición ha sido incorrecta, registramos el mensaje de error
    if( !http_response.ok )
      message = http_data.message || http_response.statusText || 'Error';
    
    // Caso de éxito
    else {
      result = 1;
      message = http_data.message || 'OK';
    }

  } catch( error ) {

    // Mensaje de error de red u otra excepción
    message = error.message || 'Network error';

  } finally {
    
    // Calculamos el objeto a devolver
    return { result, message, http_data };
    
  }
}