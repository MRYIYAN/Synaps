// ----------------------------------------------------------------------
// http.js
// Librería de funciones destinadas a ejecutar llamadas por HTTP
// ----------------------------------------------------------------------

export async function http_post( url, body, headers, credentials = 'include' ) {

  // Inicializamos el valor a devolver
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

    console.log( http_response );

    // Si la petición ha sido incorrecta, salimos del flujo
    if( !http_response.ok )
      throw new Error( 'Error' );

    // Capturamos los datos de la petición
    http_data = await http_response.json();

  } catch( error ) {

    // Mensaje de error
    message = error;
  }
  finally
  {
    // Calculamos el array a devolver
    value = {
        'result'   : result
      , 'message'  : message
      , 'http_data': http_data
    };

    return value;
  }

}