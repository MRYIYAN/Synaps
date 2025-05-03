#=================================================#
#======# Importar librerías necesarias #======#
#=================================================#
import os
from dotenv import load_dotenv

#=================================================#
#======# Cargar archivo .env explícitamente #======#
#=================================================#
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

#=================================================#
#======# Configuración de la base de datos #======#
#=================================================#
DB_HOST     = os.getenv('DB_HOST')              # Host
DB_PORT     = int(os.getenv('DB_PORT', 3306))   # Puerto
DB_USER     = os.getenv('DB_USER')              # Usuario
DB_PASSWORD = os.getenv('DB_PASSWORD')          # Contraseña
DB_NAME     = os.getenv('DB_NAME')              # Nombre

#=================================================#
#======#    Configuración del encriptado   #======#
#=================================================#
HS256_KEY   = os.getenv('HS256_KEY')            # Clave para HS256