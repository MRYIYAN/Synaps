#=================================================#
#======#   Importar librerías necesarias   #======#
#=================================================#

from flask import Flask, request, jsonify
from flask_cors import CORS  # Habilitar CORS
from auth import authenticate_user

#=================================================#
#======# Instanciar la aplicación Flask    #======#
#=================================================#
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Permitir explícitamente todos los orígenes

#---------------------------------------------------#
#======#         Discovery Endpoint          #======#
#---------------------------------------------------#
@app.route('/.well-known/openid-configuration', methods=['GET'])
def openid_configuration():
    return jsonify({
        "issuer": "http://localhost:5005",
        "token_endpoint": "http://localhost:5005/token",
        "authorization_endpoint": "http://localhost:5005/token",
        "grant_types_supported": ["password"],
        "response_types_supported": ["token"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["HS256"]
    })

#---------------------------------------------------#
#======#         Token Endpoint              #======#
#---------------------------------------------------#
@app.route('/token', methods=['POST'])
def token():
    
    # Capturamos los datos del POST
    grant_type      = request.form.get('grant_type')
    username        = request.form.get('username')
    password        = request.form.get('password')
    client_id       = request.form.get('client_id')     # Ignorado
    client_secret   = request.form.get('client_secret') # Ignorado

    # Aquí simplemente ignoramos client_id y client_secret, no hacemos nada

    # Validar el tipo de grant
    if grant_type != 'password':
        return jsonify({"error": "unsupported_grant_type"}), 400

    # Autenticar al usuario
    token = authenticate_user(username, password)
    if not token:
        return jsonify({"error": "invalid_grant"}), 401

    # Responder con el token
    return jsonify({
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": 3600
    })

#--------------------------------------------------------#
#======#       Ejecutar la aplicación Flask       #======#
#--------------------------------------------------------#
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)