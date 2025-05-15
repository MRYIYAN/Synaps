<?php

namespace App\Services;

/**
 * Servicio para operaciones relacionadas con Vaults.
 */
class VaultService
{
  /**
   * Devuelve el nombre formateado del vault (ejemplo: 0002_ABCD123)
   *
   * @param int     $vault_id   ID numérico del vault
   * @param string  $vault_id2  Identificador secundario del vault
   * @return string             Nombre formateado del vault
   */
  public function GetVaultName( int $vault_id, string $vault_id2 ): string
  {
    $vault_id_f = str_pad( ( string ) $vault_id, 4, '0', STR_PAD_LEFT );
    return $vault_id_f . '_' . $vault_id2;
  }

  /**
   * Devuelve la ruta para guardar archivos del vault en Storage.
   *
   * @param int          $vault_id   ID numérico del vault
   * @param string       $vault_id2  Identificador secundario del vault
   * @param int          $user_id   ID numérico del user
   * @param string       $user_id2  Identificador secundario del user
   * @param string|null  $filename   Nombre de archivo (opcional)
   * @return string                  Ruta resultante para Storage
   */
  public function GetVaultStoragePath( int $vault_id, string $vault_id2, int $user_id, string $user_id2, ?string $filename = null ): string
  {
    // Calculamos el usuario
    $user_id    = str_pad( ( string ) $user_id, 4, '0', STR_PAD_LEFT );
    $user_id_f  = $user_id . '_' . $user_id2;

    $vault_path = $user_id_f . '/' . 'vaults/' . $this->GetVaultName( $vault_id, $vault_id2 );
    return $filename ? $vault_path . '/' . $filename : $vault_path;
  }
}