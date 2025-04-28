#=================================================#
#======# Importar librerías necesarias #======#
#=================================================#
import os
from dotenv import load_dotenv

#=================================================#
#======# Cargar variables de entorno #======#
#=================================================#
load_dotenv()

#=================================================#
#======# Configuración de la base de datos #======#
#=================================================#
DB_HOST = os.getenv('DB_HOST')  # Host de la base de datos
DB_PORT = int(os.getenv('DB_PORT', 3306))  # Puerto de la base de datos
DB_USER = os.getenv('DB_USER')  # Usuario de la base de datos
DB_PASSWORD = os.getenv('DB_PASSWORD')  # Contraseña de la base de datos
DB_NAME = os.getenv('DB_NAME')  # Nombre de la base de datos
