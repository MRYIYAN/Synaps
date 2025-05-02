import jwt
import datetime
import config

def create_access_token( user_id, email, name ):

    # Calculamos el array de datos para la firma
    payload = {
        'sub': str( user_id ),
        'email': email,
        'name': name,
        'preferred_username': email,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta( minutes = 60 ),
        'iss': 'http://localhost:5005',  # Flask URL
        'aud': 'account'  # Keycloak expects 'account' as audience
    }

    # Generamos el token
    token = jwt.encode( payload, config.SECRET_KEY, algorithm = 'HS256' )
    return token