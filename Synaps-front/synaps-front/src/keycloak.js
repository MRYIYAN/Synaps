// Configuración de Keycloak
// Este archivo se encarga de la configuración de Keycloak para la autenticación y autorización en la aplicación.
// Se importa la librería de Keycloak y se crea una instancia de Keycloak con la configuración necesaria.
//----------------------------------------------------------------------------//
import Keycloak from "keycloak-js";
// Se crea una instancia de Keycloak con la configuración necesaria
const keycloak = new Keycloak({
  url: "http://localhost:8085", // URL del servidor de Keycloak
  realm: "Synaps", // Nombre del realm de Keycloak
  clientId: "synaps-front", // ID del cliente de Keycloak
});
//--------------------------------------------------------------------------//
export default keycloak;
