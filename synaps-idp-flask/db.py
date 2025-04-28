#=================================================#
#======# Importar librerías necesarias #======#
#=================================================#
import pymysql
import config

#=================================================#
#======# Función para obtener usuario por email #======#
#=================================================#
def get_user_by_email(email):
    #------# Conectar a la base de datos #------#
    connection = pymysql.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME,
        port=config.DB_PORT
    )
    try:
        #------# Ejecutar consulta SQL #------#
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT id, email, password, name FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            user = cursor.fetchone()
            return user
    finally:
        #------# Cerrar la conexión #------#
        connection.close()
