//====================================================================================//
//                          GESTOR DE SESIÓN DE VAULTS                               //
//====================================================================================//
//  Este módulo maneja la autenticación de PINs de vaults durante la sesión del      //
//  usuario. Permite recordar qué vaults ya han sido autenticadas para evitar        //
//  solicitar el PIN múltiples veces en la misma sesión.                             //
//====================================================================================//

/**
 * Clave para almacenar las vaults autenticadas en sessionStorage
 */
const AUTHENTICATED_VAULTS_KEY = 'synaps_authenticated_vaults';

/**
 * Gestor de sesión para vaults autenticadas
 */
class VaultSessionManager {
  
  /**
   * Verifica si una vault ya está autenticada en la sesión actual
   * @param {string} vaultId2 - ID único de la vault
   * @returns {boolean} - true si ya está autenticada, false si no
   */
  static isVaultAuthenticated(vaultId2) {
    try {
      if (!vaultId2) return false;
      
      const authenticatedVaults = this.getAuthenticatedVaults();
      return authenticatedVaults.includes(vaultId2);
    } catch (error) {
      console.warn('Error al verificar vault autenticada:', error);
      return false;
    }
  }

  /**
   * Marca una vault como autenticada en la sesión actual
   * @param {string} vaultId2 - ID único de la vault
   */
  static markVaultAsAuthenticated(vaultId2) {
    try {
      if (!vaultId2) {
        console.warn('No se puede marcar vault sin ID como autenticada');
        return;
      }

      const authenticatedVaults = this.getAuthenticatedVaults();
      
      // Solo agregar si no está ya en la lista
      if (!authenticatedVaults.includes(vaultId2)) {
        authenticatedVaults.push(vaultId2);
        this.saveAuthenticatedVaults(authenticatedVaults);
        console.log(`Vault ${vaultId2} marcada como autenticada para esta sesión`);
      }
    } catch (error) {
      console.error('Error al marcar vault como autenticada:', error);
    }
  }

  /**
   * Remueve una vault de la lista de autenticadas
   * @param {string} vaultId2 - ID único de la vault
   */
  static removeVaultAuthentication(vaultId2) {
    try {
      const authenticatedVaults = this.getAuthenticatedVaults();
      const filteredVaults = authenticatedVaults.filter(id => id !== vaultId2);
      this.saveAuthenticatedVaults(filteredVaults);
      console.log(`Autenticación de vault ${vaultId2} removida de la sesión`);
    } catch (error) {
      console.error('Error al remover autenticación de vault:', error);
    }
  }

  /**
   * Limpia todas las vaults autenticadas de la sesión
   */
  static clearAllAuthentications() {
    try {
      sessionStorage.removeItem(AUTHENTICATED_VAULTS_KEY);
      console.log('Todas las autenticaciones de vaults han sido limpiadas');
    } catch (error) {
      console.error('Error al limpiar autenticaciones:', error);
    }
  }

  /**
   * Obtiene la lista de vaults autenticadas desde sessionStorage
   * @returns {string[]} - Array de IDs de vaults autenticadas
   */
  static getAuthenticatedVaults() {
    try {
      const stored = sessionStorage.getItem(AUTHENTICATED_VAULTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error al leer vaults autenticadas:', error);
      return [];
    }
  }

  /**
   * Guarda la lista de vaults autenticadas en sessionStorage
   * @param {string[]} vaultIds - Array de IDs de vaults autenticadas
   */
  static saveAuthenticatedVaults(vaultIds) {
    try {
      sessionStorage.setItem(AUTHENTICATED_VAULTS_KEY, JSON.stringify(vaultIds));
    } catch (error) {
      console.error('Error al guardar vaults autenticadas:', error);
    }
  }

  /**
   * Verifica si una vault necesita autenticación por PIN
   * @param {Object} vault - Objeto vault a verificar
   * @returns {boolean} - true si necesita PIN, false si no
   */
  static vaultNeedsAuthentication(vault) {
    if (!vault) {
      console.warn('No se puede verificar autenticación de vault undefined/null');
      return false;
    }

    if (!vault.is_private) {
      return false; // No es privada
    }

    if (!vault.pin) {
      return false; // No tiene PIN configurado
    }

    if (!vault.vault_id2) {
      console.warn('Vault privada sin vault_id2, no se puede verificar autenticación');
      return true; // Por seguridad, requerir autenticación
    }

    return !this.isVaultAuthenticated(vault.vault_id2);
  }

  /**
   * Maneja el logout del usuario limpiando las autenticaciones
   */
  static handleUserLogout() {
    this.clearAllAuthentications();
  }

  /**
   * Obtiene información de debug sobre las vaults autenticadas
   * @returns {Object} - Información de debug
   */
  static getDebugInfo() {
    return {
      authenticatedVaults: this.getAuthenticatedVaults(),
      sessionStorageSupported: typeof(Storage) !== "undefined",
      sessionKey: AUTHENTICATED_VAULTS_KEY
    };
  }
}

export default VaultSessionManager;