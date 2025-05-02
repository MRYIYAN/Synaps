import Keycloak from "keycloak-js";

// Creamos una instancia Keycloack para manejar las peticiones sin autentificar
const keycloak = new Keycloak( {
    url:      'http://localhost:8085'
  , realm:    'Synaps'
  , clientId: 'synaps-front'
} );

// Exportamos la configuración adicional para evitar login-status-iframe
export const keycloakInitOptions = {
  checkLoginIframe: false
};

export default keycloak;