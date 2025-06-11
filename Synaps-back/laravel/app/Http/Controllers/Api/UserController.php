<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Helpers\AuthHelper;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Controlador responsable de la gestión de usuarios en Synaps.
 */
class UserController extends Controller
{
    /**
     * GET /api/user
     * 
     * Obtiene la información del usuario autenticado
     */
    public function getUser(Request $request): JsonResponse
    {
        // Inicializar value con valor por defecto
        $value = response()->json([
            'result' => 0,
            'message' => 'Usuario no autenticado'
        ], 401);

        try {
            // Obtener el identificador del usuario autenticado usando AuthHelper
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if( $auth_result['error_response'] ) {
                throw new Exception( 'Usuario no autenticado' );
            }
            $user_id = $auth_result['user_id'];

            // Buscar el usuario en la base de datos
            $user = User::find( $user_id );

            if( !$user ) {
                throw new Exception( 'Usuario no encontrado' );
            }

            $value = response()->json([
                'result' => 1,
                'message' => 'Usuario obtenido exitosamente',
                'user' => [
                    'id' => $user->user_id,
                    'name' => $user->user_name,
                    'email' => $user->user_email,
                    'profile_photo' => $user->user_profile_photo ? url('storage/' . $user->user_profile_photo) : null,
                    // No incluir la contraseña por seguridad
                ]
            ]);

        } catch (Exception $e) {
            $value = response()->json([
                'result' => 0,
                'message' => 'Error al obtener el usuario: ' . $e->getMessage()
            ], 500);
        }

        // Retornar value
        return $value;
    }

    /**
     * PUT /api/user
     * 
     * Actualiza la información del usuario autenticado
     */
    public function updateUser(Request $request): JsonResponse
    {
        // Inicializar value con valor por defecto
        $value = response()->json([
            'result' => 0,
            'message' => 'Error al actualizar usuario'
        ], 500);

        try {
            // Obtener el identificador del usuario autenticado usando AuthHelper
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if( $auth_result['error_response'] ) {
                throw new Exception( 'Usuario no autenticado' );
            }
            $user_id = $auth_result['user_id'];

            // Buscar el usuario en la base de datos
            $user = User::find( $user_id );

            if( !$user ) {
                throw new Exception( 'Usuario no encontrado' );
            }

            // Validar los datos de entrada
            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|min:2|max:255',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users', 'user_email')->ignore($user->user_id, 'user_id')
                ],
                'currentPassword' => 'sometimes|required_with:newPassword|string',
                'newPassword' => 'sometimes|required_with:currentPassword|string|min:6|max:255',
                'profilePhoto' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:5120', // Máximo 5MB
            ]);

            // Verificar contraseña actual si se está cambiando
            if (isset($validatedData['currentPassword']) && isset($validatedData['newPassword'])) {
                if (!Hash::check($validatedData['currentPassword'], $user->user_password)) {
                    $value = response()->json([
                        'result' => 0,
                        'message' => 'La contraseña actual es incorrecta'
                    ], 400);
                    return $value;
                }
            }

            // Actualizar los campos modificados
            $updated = false;

            if (isset($validatedData['name']) && $validatedData['name'] !== $user->user_name) {
                $user->user_name = $validatedData['name'];
                $updated = true;
            }

            if (isset($validatedData['email']) && $validatedData['email'] !== $user->user_email) {
                $user->user_email = $validatedData['email'];
                $updated = true;
            }

            if (isset($validatedData['newPassword'])) {
                $user->user_password = Hash::make($validatedData['newPassword']);
                $updated = true;
            }

            // Manejar subida de foto de perfil
            if ($request->hasFile('profilePhoto')) {
                // Eliminar foto anterior si existe
                if ($user->user_profile_photo) {
                    Storage::disk('public')->delete($user->user_profile_photo);
                }

                // Subir nueva foto
                $photoPath = $request->file('profilePhoto')->store('profile_photos', 'public');
                $user->user_profile_photo = $photoPath;
                $updated = true;
            }

            if ($updated) {
                $user->save();
            }

            return response()->json([
                'result' => 1,
                'message' => $updated ? 'Usuario actualizado exitosamente' : 'No hay cambios para actualizar',
                'user' => [
                    'id' => $user->user_id,
                    'name' => $user->user_name,
                    'email' => $user->user_email,
                    'profile_photo' => $user->user_profile_photo ? url('storage/' . $user->user_profile_photo) : null,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'result' => 0,
                'message' => 'Datos de validación incorrectos',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'result' => 0,
                'message' => 'Error al actualizar el usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/user/first-login
     * 
     * Verifica si es el primer login del usuario y actualiza el estado
     */
    public function checkFirstLogin(Request $request): JsonResponse
    {
        // Inicializar value con valor por defecto
        $value = response()->json([
            'result' => 0,
            'message' => 'Error al verificar primer login',
            'first_login' => false
        ]);

        try {
            // Obtener el identificador del usuario autenticado usando AuthHelper
            $auth_result = AuthHelper::getAuthenticatedUserId();
            if( $auth_result['error_response'] ) {
                throw new Exception( 'Usuario no autenticado' );
            }
            $user_id = $auth_result['user_id'];

            // Buscar el usuario en la base de datos
            $user = User::find( $user_id );

            if( !$user ) {
                throw new Exception( 'Usuario no encontrado' );
            }

            // Verificar si es el primer login
            $isFirstLogin = (bool) $user->first_login;

            // Si es primer login, actualizarlo a false
            if( $isFirstLogin ) {
                $user->first_login = false;
                $user->save();
            }

            $value = response()->json([
                'result' => 1,
                'message' => 'Estado de primer login verificado exitosamente',
                'first_login' => $isFirstLogin
            ]);

        } catch (Exception $e) {
            $value = response()->json([
                'result' => 0,
                'message' => 'Error al verificar primer login: ' . $e->getMessage(),
                'first_login' => false
            ], 500);
        }

        // Retornar value
        return $value;
    }
}
