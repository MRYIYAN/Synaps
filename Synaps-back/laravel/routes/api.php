<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/hello', function (Request $request) {
    return response()->json([
        'message' => 'Hola desde Laravel y Bienvenido a Synaps, el back esta funcionando',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);
