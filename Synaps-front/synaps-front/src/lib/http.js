// ----------------------------------------------------------------------
// http.js
// Librería de funciones destinadas a ejecutar llamadas por HTTP
// ----------------------------------------------------------------------

// Función helper para mostrar notificaciones de error
const showHttpErrorNotification = (message, status) => {
  if (window.showNotification) {
    let title = 'Error HTTP';
    
    // Personalizar título según el status
    if (status >= 400 && status < 500) {
      title = 'Error del Cliente';
    } else if (status >= 500) {
      title = 'Error del Servidor';
    } else if (status === 0) {
      title = 'Error de Conexión';
    }
    
    window.showNotification({
      type: 'error',
      title,
      message: message || 'Ha ocurrido un error en la petición HTTP',
      duration: 5000
    });
  }
};

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

    // Agregar token de autorización si existe
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
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
    if( !http_response.ok ) {
      message = http_data.message || http_response.statusText || 'Error';
      // Mostrar notificación de error
      showHttpErrorNotification(message, http_response.status);
    }

    // Caso de éxito
    else {
      result  = 1;
      message = http_data.message || 'OK';
    }

  } catch( error ) {

    // Mensaje de error
    message = error.message || 'Network error';
    // Mostrar notificación de error de red
    showHttpErrorNotification(message, 0);
  }
  finally
  {
    // Calculamos el array a devolver
    value = { result, message, http_data };
    return value;
  }

}

// Helper para GET con Bearer
export async function http_get( url, body = {} ) {

  // Inicializamos el valor a devolver
  let result    = 0;
  let message   = '';
  let http_data = [];

  // Define headers y credentials por defecto
  let headers = {
    Accept: 'application/json'
  };

  // Agregar token de autorización si existe
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  let credentials = 'include';

  try {

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
    if( !http_response.ok ) {
      message = http_data.message || http_response.statusText || 'Error';
      // Mostrar notificación de error
      showHttpErrorNotification(message, http_response.status);
    }
    
    // Caso de éxito
    else {
      result = 1;
      message = http_data.message || 'OK';
    }

  } catch( error ) {

    // Mensaje de error de red u otra excepción
    message = error.message || 'Network error';
    // Mostrar notificación de error de red
    showHttpErrorNotification(message, 0);

  } finally {
    
    // Calculamos el objeto a devolver
    return { result, message, http_data };
    
  }
}

// Helper para PUT con Bearer
export async function http_put( url, body, headers, credentials = 'include' ) {

  // Inicializamos los valores a devolver
  let result    = 0;
  let message   = '';
  let http_data = [];

  try {
    
    // Si no se han especificado cabeceras, insertamos las de JSON por defecto
    if( !headers ) {
      headers = {
          'Content-Type': 'application/json'
        , Accept        : 'application/json'
      }; 
    }

    // Agregar token de autorización si existe
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    // Ejecutamos la solicitud PUT a la ruta backend especificada
    let http_response = await fetch( url, {
        method     : 'PUT'
      , headers    : headers
      , credentials: credentials
      , body       : JSON.stringify( body )
    } );

    // Capturamos los datos de la respuesta
    http_data = await http_response.json();

    // Si la petición ha sido incorrecta, registramos el mensaje de error
    if( !http_response.ok ) {
      message = http_data.message || http_response.statusText || 'Error';
      // Mostrar notificación de error
      showHttpErrorNotification(message, http_response.status);
    }
    
    // Caso de éxito
    else {
      result = 1;
      message = http_data.message || 'OK';
    }

  } catch( error ) {

    // Mensaje de error de red u otra excepción
    message = error.message || 'Network error';
    
    // Mostrar notificación de error de red
    showHttpErrorNotification( message, 0 );

  } finally {
    
    // Calculamos el objeto a devolver
    return { result, message, http_data };
    
  }
}

// Helper para PUT con FormData (multipart)
export async function http_put_multipart( url, formData, credentials = 'include' ) {

  // Inicializamos los valores a devolver
  let result    = 0;
  let message   = '';
  let http_data = [];

  try {
    
    // Para FormData no especificamos Content-Type, el navegador lo hará automáticamente
    let headers = {
      Accept: 'application/json'
    };

    // Agregar token de autorización si existe
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    // Ejecutamos la solicitud PUT a la ruta backend especificada
    let http_response = await fetch( url, {
        method     : 'PUT'
      , headers    : headers
      , credentials: credentials
      , body       : formData
    } );

    // Capturamos los datos de la respuesta
    http_data = await http_response.json();

    // Si la petición ha sido incorrecta, registramos el mensaje de error
    if( !http_response.ok ) {
      message = http_data.message || http_response.statusText || 'Error';
      // Mostrar notificación de error
      showHttpErrorNotification(message, http_response.status);
    }
    
    // Caso de éxito
    else {
      result = 1;
      message = http_data.message || 'OK';
    }

  } catch( error ) {

    // Mensaje de error de red u otra excepción
    message = error.message || 'Network error';
    // Mostrar notificación de error de red
    showHttpErrorNotification(message, 0);

  } finally {
    
    // Calculamos el objeto a devolver
    return { result, message, http_data };
    
  }
}

// Helper para POST con FormData (multipart)
export async function http_post_multipart( url, formData, credentials = 'include' ) {

  // Inicializamos los valores a devolver
  let result    = 0;
  let message   = '';
  let http_data = [];

  try {
    
    // Para FormData no especificamos Content-Type, el navegador lo hará automáticamente
    let headers = {
      Accept: 'application/json'
    };

    // Agregar token de autorización si existe
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    // Ejecutamos la solicitud POST a la ruta backend especificada
    let http_response = await fetch( url, {
        method     : 'POST'
      , headers    : headers
      , credentials: credentials
      , body       : formData
    } );

    // Capturamos los datos de la respuesta
    http_data = await http_response.json();

    // Si la petición ha sido incorrecta, registramos el mensaje de error
    if( !http_response.ok ) {
      message = http_data.message || http_response.statusText || 'Error';
      // Mostrar notificación de error
      showHttpErrorNotification(message, http_response.status);
    }
    
    // Caso de éxito
    else {
      result = 1;
      message = http_data.message || 'OK';
    }

  } catch( error ) {

    // Mensaje de error de red u otra excepción
    message = error.message || 'Network error';
    // Mostrar notificación de error de red
    showHttpErrorNotification(message, 0);

  } finally {
    
    // Calculamos el objeto a devolver
    return { result, message, http_data };
    
  }
}