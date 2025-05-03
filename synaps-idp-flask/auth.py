from db import get_user_by_email
from jwt_utils import create_access_token
import bcrypt

def authenticate_user(email, password):
    user = get_user_by_email(email)
    print("DEBUG USER:", user)  # Log temporal para depurar datos del usuario
    if not user:
        return None

    hashed = user['password'].encode()

    # Compatibilidad con hash bcrypt $2y$
    if hashed.startswith(b"$2y$"):
        hashed = b"$2b$" + hashed[4:]

    # Verificar la contraseña
    if not bcrypt.checkpw(password.encode(), hashed):
        return None

    # Generar token JWT
    token = create_access_token(user['id'], user['email'], user['name'])
    return token
