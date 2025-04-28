# Usamos una imagen ligera de Python
FROM python:3.11-slim

# Creamos el directorio de la app
WORKDIR /app

# Copiamos los archivos necesarios
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponemos el puerto 5000 (donde corre Flask)
EXPOSE 5000

# Comando para arrancar la app
CMD ["python", "app.py"]