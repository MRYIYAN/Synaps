
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
  if (!initialized)
    return <div>Cargando autenticación...</div>;

  // Según si el usuario está autenticado o no, mostramos el botón de inicio de sesión 
  // o los detalles del usuario y el botón de cerrar sesión
  let authenticated = keycloak.authenticated;

  return (
    <div>
      {
        // Si Keycloak no está autenticado, mostramos el botón de inicio de sesión
        !authenticated ? (
          <button onClick={() => keycloak.login()}>Iniciar sesión con Keycloak</button>

        // Si está autenticado, mostramos el nombre de usuario y el botón de cierre de sesión
        ) : (
          <>
            <p>Bienvenido {keycloak.tokenParsed?.preferred_username}</p>
            <button onClick={() => keycloak.logout()}>Cerrar sesión</button>
          </>
        )
      }
    </div>
  );
};

export default AuthButtons;
