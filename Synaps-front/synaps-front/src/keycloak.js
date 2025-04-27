import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8085",
  realm: "Synaps",
  clientId: "synaps-front",
});

// Exportamos la configuración adicional para evitar login-status-iframe
export const keycloakInitOptions = {
  checkLoginIframe: false,
};

export default keycloak;
