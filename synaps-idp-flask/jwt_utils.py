import jwt
import datetime

SECRET_KEY = "SYNAPS_SUPER_SECRET"  # ⚡ Puedes cambiarlo si quieres

def create_access_token(user_id, email, name):
    payload = {
        "sub": str(user_id),
        "email": email,
        "name": name,
        "preferred_username": email,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
        "iss": "http://localhost:5000",  # Flask URL
        "aud": "account"  # Keycloak expects 'account' as audience
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token
