<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        try {
            // Obtener el usuario autenticado desde Laravel Auth
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            return response()->json([
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
            return response()->json([
                'result' => 0,
                'message' => 'Error al obtener el usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/user
     * 
     * Actualiza la información del usuario autenticado
     */
    public function updateUser(Request $request): JsonResponse
    {
        try {
            // Obtener el usuario autenticado desde Laravel Auth
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'result' => 0,
                    'message' => 'Usuario no autenticado'
                ], 401);
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
                    return response()->json([
                        'result' => 0,
                        'message' => 'La contraseña actual es incorrecta'
                    ], 400);
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
}
