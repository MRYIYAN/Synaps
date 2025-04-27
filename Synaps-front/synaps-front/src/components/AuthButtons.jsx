
//============================================================//
//                         IMPORTS                            //
import { useKeycloak } from "@react-keycloak/web";
//============================================================//

//============================================================//
//                         COMPONENTES                        //
//============================================================//
// Este componente se encarga de mostrar los botones de autenticación
const AuthButtons = () => {
    // Obtenemos el objeto keycloak y el estado de inicialización
  const { keycloak, initialized } = useKeycloak();
    // Si no se ha inicializado Keycloak, mostramos un mensaje de carga
  if (!initialized) {
    return <div>Cargando autenticación...</div>;
  }

    // Si Keycloak no está autenticado, mostramos el botón de inicio de sesión
    // Si está autenticado, mostramos el nombre de usuario y el botón de cierre de sesión
  return (
    <div>
      {!keycloak.authenticated ? (
        <button onClick={() => keycloak.login()}>Login con Keycloak</button>
      ) : (
        <>
          <p>Bienvenido {keycloak.tokenParsed?.preferred_username}</p>
          <button onClick={() => keycloak.logout()}>Logout</button>
        </>
      )}
    </div>
  );
};

export default AuthButtons;
