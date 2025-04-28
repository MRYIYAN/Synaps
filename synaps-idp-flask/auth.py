from db import get_user_by_email
from jwt_utils import create_access_token
from werkzeug.security import check_password_hash

def authenticate_user(email, password):
    user = get_user_by_email(email)
    if not user:
        return None

    # Validar contraseña
    if not check_password_hash(user['password'], password):
        return None

    # Generar token JWT
    token = create_access_token(user['id'], user['email'], user['name'])
    return token
